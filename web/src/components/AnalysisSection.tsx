import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AnalysisSectionProps {
    analysis: string;
}

const AnalysisSection = ({ analysis }: AnalysisSectionProps) => {
    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-100">
            <div className="p-6 border-b border-blue-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <span className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">🤖</span>
                    AI Analysis Results
                </h2>
            </div>

            <div className="p-6">
                <div className="prose prose-sm max-w-none">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({ children }) => <h1 className="text-2xl font-bold text-gray-800 mb-4">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-xl font-semibold text-gray-700 mb-3 mt-6">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-lg font-medium text-gray-600 mb-2 mt-4">{children}</h3>,
                                p: ({ children }) => <p className="text-gray-700 mb-3 leading-relaxed">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-2">{children}</ol>,
                                li: ({ children }) => <li className="text-gray-700">{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
                                em: ({ children }) => <em className="italic text-gray-600">{children}</em>,
                                blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50 rounded-r-lg my-4">{children}</blockquote>,
                            }}
                        >
                            {analysis}
                        </ReactMarkdown>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">
                        ⚠️ <strong>Important:</strong> This AI analysis is for informational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for medical decisions.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AnalysisSection;
