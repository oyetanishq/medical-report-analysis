import { useState } from "react";
import FileUpload from "@/components/file-upload";
import PatientForm from "@/components/patient-details";
import ReportDisplay from "@/components/report-display";
import AnalysisSection from "@/components/analysis-section";
import Chatbot from "@/components/chatbot";

export interface PatientData {
    age: string;
    gender: string;
    weight: string;
    symptoms: string;
}

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
            const response = await fetch(import.meta.env.VITE_MEDICAL_REPORT_ANALYSIS, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    report_content: reportContent,
                    patient_details: patientData,
                }),
            });
            if (!response.ok) {
                throw new Error("Failed to convert PDF");
            }

            const { patient_summary, patient_biomakers_trends } = await response.json();

            setAnalysisResult1(patient_summary);
            setAnalysisResult2(patient_biomakers_trends);
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
                    <div className="space-y-6">
                        <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} uploadedFile={uploadedFile} />
                        <PatientForm patientData={patientData} onDataChange={setPatientData} />
                    </div>

                    <div className="space-y-6">
                        <ReportDisplay content={reportContent} isProcessing={isProcessing} onAnalyze={handleAnalysis} canAnalyze={!!reportContent && !!patientData.age} isAnalyzing={isAnalyzing} />
                        {analysisResult1 && <AnalysisSection analysis={analysisResult1} />}
                        {analysisResult2 && <AnalysisSection analysis={analysisResult2} />}

                        {analysisResult1 && <Chatbot patient_report_summary={analysisResult1} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;
