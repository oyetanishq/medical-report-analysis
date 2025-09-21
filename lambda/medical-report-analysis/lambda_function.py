import json
import requests
import os

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}"

def patient_summary_prompt(report_content, patient_details):
    return f"""Role: You are an expert Medical Data Analyst AI.

Objective: Your task is to synthesize information from three distinct sources—a general medical report, extracted form data, and a table of biomarker metrics—into a single, cohesive narrative summary. This summary should read like a concise clinical overview for a medical professional.

Input Data Format:

You will be provided with the following data:

[MEDICAL REPORT]: A block of text in Markdown format containing the patient's history, reported symptoms, and physician's notes.

[FORM DATA]: A key-value block representing data extracted from a patient information form.

[BIOMARKER TABLE]: A table in Markdown format containing lab results, including the biomarker name, its measured value, units, and the standard reference range.

Your Task:

Analyze and Extract: Carefully read and extract all medically relevant information from all three sources. This includes patient demographics, symptoms, diagnoses, medical history, and all biomarker values.

Synthesize and Summarize: Weave all the extracted information into a single, well-structured paragraph. The summary must be 8-10 lines long. If the amount of data requires more space, you may extend the summary slightly, but do not omit any medical information.

Integrate Biomarkers: For each biomarker in the table, you must state its value. Crucially, compare the value to the provided "Normal Range" and explicitly mention if the biomarker is high, low, or within the normal range.

Narrative Flow: The final output should be a fluid narrative, not just a list of facts. Start with the patient's basic demographics and chief complaints, followed by clinical findings and lab results.

[MEDICAL REPORT]:
${report_content}

[FORM DATA]:
Age: ${patient_details['age']}
Gender: ${patient_details['gender']}
Weight: ${patient_details['weight']}kg
Recent Symptoms: ${patient_details['symptoms']}

[BIOMARKER TABLE]:
Please analyze the medical report above and provide a comprehensive medical analysis.
"""

def patient_bio_makers_prompt(report_content, patient_details):
    return f"""Role: You are an expert AI Health Advisor. Your purpose is to analyze patient medical data and present it in a clear, structured, and actionable format. You are NOT a doctor, and all your advice is for informational purposes and should be reviewed by a qualified medical professional.

Objective: Your task is to process a patient's medical file, which includes a general report, form data, and a table of biomarkers. Based on this information, you will produce a detailed risk analysis report. This report must categorize each biomarker's risk level, provide actionable recommendations for high-risk markers, and explain the potential consequences of inaction.

Input Data Format:

You will receive three pieces of information:

[MEDICAL REPORT]: A narrative report in Markdown containing the physician's notes, patient's symptoms, and preliminary diagnosis.
${report_content}

[FORM DATA]: Key-value pairs with patient demographic and lifestyle information.
Age: ${patient_details['age']}
Gender: ${patient_details['gender']}
Weight: ${patient_details['weight']}kg
Recent Symptoms: ${patient_details['symptoms']}

[BIOMARKER TABLE]: A Markdown table of lab results with columns for the biomarker, its value, unit, and the normal range.
Please analyze the medical report above

Your Task & Output Structure:

You must generate a response organized into the following three sections. Do not omit any medical data provided in the input.

1. Biomarker Risk Analysis

Create a detailed table with the following columns:

Biomarker: The name of the lab metric.

Value: The patient's result with its unit.

Normal Range: The standard reference range.

Risk Level: Categorize the result into one of three levels:

Safe: The value is within the normal range.

Mid-Risk: The value is borderline or slightly outside the normal range, warranting monitoring.

Not Safe (High Risk): The value is significantly outside the normal range and requires attention.

Recommendations (for Not Safe / High Risk): If a biomarker is "Not Safe," provide clear, actionable advice. This should include lifestyle changes (diet, exercise) and a strong recommendation to consult their doctor for a treatment plan. For "Safe" or "Mid-Risk," you can state "Continue monitoring" or "Maintain healthy lifestyle."

Potential Consequences (if ignored): For each "Not Safe" biomarker, explain the potential health problems or diseases that could develop if the issue is not addressed.

2. Important Disclaimer

Conclude your entire response with the following mandatory disclaimer to ensure user safety.
"""

def call_gemini(prompt):
    body = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }
    resp = requests.post(GEMINI_URL, json=body, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    try:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        return json.dumps(data)  # fallback if unexpected response

def lambda_handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method")

    # Preflight CORS
    if method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
            },
            "body": ""
        }

    try:
        body = json.loads(event.get("body", "{}"))
        report_content = body.get("report_content", "")
        patient_details = body.get("patient_details", {})

        if not report_content or not patient_details:
            return {
                "statusCode": 400,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"error": "Missing report_content or patient_details"})
            }

        patient_summary = call_gemini(patient_summary_prompt(report_content, patient_details))
        patient_biomakers_trends = call_gemini(patient_bio_makers_prompt(report_content, patient_details))

        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({
                "patient_summary": patient_summary,
                "patient_biomakers_trends": patient_biomakers_trends
            })
        }

    except Exception as e:
        print(f"Error: {e}")
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST,OPTIONS",
            },
            "body": json.dumps({"error": str(e)})
        }