import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ReportDisplayProps {
    content: string;
    isProcessing: boolean;
    onAnalyze: () => void;
    canAnalyze: boolean;
    isAnalyzing: boolean;
}

const ReportDisplay = ({ content, isProcessing, onAnalyze, canAnalyze, isAnalyzing }: ReportDisplayProps) => {
    return (
        <div className="bg-white rounded-xl shadow-lg border border-orange-100">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <span className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">📋</span>
                        Report Content
                    </h2>

                    {content && (
                        <button
                            onClick={onAnalyze}
                            disabled={!canAnalyze || isAnalyzing}
                            className={`
                                px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2
                                ${canAnalyze && !isAnalyzing ? "bg-orange-500 text-white shadow-lg hover:shadow-xl" : "bg-gray-300 text-gray-500 cursor-not-allowed"}
                            `}
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Analyzing...</span>
                                </>
                            ) : (
                                <>
                                    <span>🔍</span>
                                    <span>Analyze Report</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6">
                {isProcessing ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-16 h-16 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-600">Converting PDF to readable format...</p>
                    </div>
                ) : content ? (
                    <div className="prose prose-sm max-w-none">
                        <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h1: ({ children }) => <h1 className="text-2xl font-bold text-gray-800 mb-4">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-xl font-semibold text-gray-700 mb-3 mt-6">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-lg font-medium text-gray-600 mb-2 mt-4">{children}</h3>,
                                    p: ({ children }) => <p className="text-gray-600 mb-2 leading-relaxed">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">{children}</ul>,
                                    li: ({ children }) => <li className="text-gray-600">{children}</li>,
                                    strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl text-gray-400">📄</span>
                        </div>
                        <p className="text-gray-500">Upload a medical report to view its content here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportDisplay;
