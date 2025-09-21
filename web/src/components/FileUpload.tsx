import { useRef, DragEvent, ChangeEvent } from "react";

interface FileUploadProps {
    onFileUpload: (file: File) => void;
    isProcessing: boolean;
    uploadedFile: File | null;
}

const FileUpload = ({ onFileUpload, isProcessing, uploadedFile }: FileUploadProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === "application/pdf") {
            onFileUpload(files[0]);
        }
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onFileUpload(files[0]);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-8 h-8 bg-coral-500 rounded-lg flex items-center justify-center mr-3">📄</span>
                Upload Medical Report
            </h2>

            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={handleClick}
                className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300
          ${isProcessing ? "border-gray-300 bg-gray-50" : "border-coral-300 bg-coral-50 hover:border-coral-400 hover:bg-coral-100"}
        `}
            >
                <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" disabled={isProcessing} />

                {isProcessing ? (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-600">Processing your medical report...</p>
                    </div>
                ) : uploadedFile ? (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">✅</div>
                        <p className="text-green-700 font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-gray-500 mt-2">File uploaded successfully</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-coral-100 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">📁</span>
                        </div>
                        <p className="text-gray-700 font-medium mb-2">Drop your PDF here or click to browse</p>
                        <p className="text-sm text-gray-500">Only PDF files are supported</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload;
