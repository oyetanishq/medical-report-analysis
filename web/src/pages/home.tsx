import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import PatientForm from "@/components/PatientForm";
import ReportDisplay from "@/components/ReportDisplay";
import AnalysisSection from "@/components/AnalysisSection";
import { getBioMakersDetails, patientSummarise } from "@/utils/prompts";

export interface PatientData {
    age: string;
    gender: string;
    weight: string;
    symptoms: string;
}

const askGemini = async (prompt: string) => {
    const response = await fetch(import.meta.env.VITE_GEMINI_KEY, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: prompt,
                        },
                    ],
                },
            ],
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to get analysis from Gemini API");
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate analysis";
};

const Index = () => {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [patientData, setPatientData] = useState<PatientData>({
        age: "",
        gender: "",
        weight: "",
        symptoms: "",
    });
    const [reportContent, setReportContent] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [analysisResult1, setAnalysisResult1] = useState<string>("");
    const [analysisResult2, setAnalysisResult2] = useState<string>("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleFileUpload = async (file: File) => {
        setUploadedFile(file);
        setIsProcessing(true);

        try {
            const fileArrayBuffer = await file.arrayBuffer();

            const response = await fetch(import.meta.env.VITE_PDF_TO_TEXT_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/pdf",
                },
                body: fileArrayBuffer,
            });

            if (!response.ok) {
                throw new Error("Failed to convert PDF");
            }

            const result = await response.text();
            setReportContent(result);
        } catch (error) {
            console.error("Error processing PDF:", error);
            alert("there was some error processing pdf");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAnalysis = async () => {
        if (!reportContent || !patientData.age) return;
        setIsAnalyzing(true);

        try {
            setAnalysisResult1(await askGemini(patientSummarise(reportContent, patientData)));
            setAnalysisResult2(await askGemini(getBioMakersDetails(reportContent, patientData)));
        } catch (error) {
            console.error("Error analyzing report:", error);
            alert("there was some error processing your request");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-coral-50 to-amber-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Medical Report Analysis</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">Upload your medical report and provide patient information for AI-powered analysis and insights</p>
                </div>

                <div className="grid grid-cols-1 gap-8 max-w-7xl mx-auto">
                    {/* Left Column - Input Section */}
                    <div className="space-y-6">
                        <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} uploadedFile={uploadedFile} />
                        <PatientForm patientData={patientData} onDataChange={setPatientData} />
                    </div>

                    {/* Right Column - Results Section */}
                    <div className="space-y-6">
                        <ReportDisplay content={reportContent} isProcessing={isProcessing} onAnalyze={handleAnalysis} canAnalyze={!!reportContent && !!patientData.age} isAnalyzing={isAnalyzing} />
                        {analysisResult1 && <AnalysisSection analysis={analysisResult1} />}
                        {analysisResult2 && <AnalysisSection analysis={analysisResult2} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;
