import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

interface ChatbotProps {
    patient_report_summary: string;
}

const Chatbot = ({ patient_report_summary }: ChatbotProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            isUser: true,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText("");
        setIsLoading(true);

        try {
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
                                    text: `You are a professional medical assistant AI. Your task is to carefully analyze patient details and answer medical questions accurately and clearly, using evidence-based reasoning.\nPatient Details: ${patient_report_summary}\nPatient Question: ${inputText}\n\nInstructions:\n- Provide clear, concise answers.\n- If uncertain, indicate that more tests or doctor consultation is needed.\n- Do not give personal medical diagnosis; only provide guidance or explanations.\n- Use simple language understandable by a patient or caregiver.\n\nAnswer:`,
                                },
                            ],
                        },
                    ],
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get response from Gemini API");
            }

            const data = await response.json();
            const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I could not generate a response.";

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponse,
                isUser: false,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "Sorry, there was an error processing your message. Please check your API key and try again.",
                isUser: false,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-orange-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-coral-500 text-white p-4">
                <h3 className="text-lg font-semibold">Medical Assistant Chatbot</h3>
                <p className="text-orange-100 text-sm">Ask me anything about medical topics</p>
            </div>

            <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && <div className="text-gray-500 text-center py-8">Start a conversation by typing a message below</div>}

                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.isUser ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-800"}`}>
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
                                {message.text}
                            </ReactMarkdown>
                            <p className="text-xs mt-1 opacity-70">{message.timestamp.toLocaleTimeString()}</p>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
                                <span className="text-sm">Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputText.trim()}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
