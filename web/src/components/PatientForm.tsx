interface PatientData {
    age: string;
    gender: string;
    weight: string;
    symptoms: string;
}

interface PatientFormProps {
    patientData: PatientData;
    onDataChange: (data: PatientData) => void;
}

const PatientForm = ({ patientData, onDataChange }: PatientFormProps) => {
    const handleInputChange = (field: keyof PatientData, value: string) => {
        onDataChange({
            ...patientData,
            [field]: value,
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">👤</span>
                Patient Information
            </h2>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                        <input
                            type="number"
                            required
                            value={patientData.age}
                            onChange={(e) => handleInputChange("age", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 transition-colors"
                            placeholder="Enter age"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <select required value={patientData.gender} onChange={(e) => handleInputChange("gender", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 transition-colors">
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                    <input
                        type="number"
                        required
                        value={patientData.weight}
                        onChange={(e) => handleInputChange("weight", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 transition-colors"
                        placeholder="Enter weight in kg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recent Symptoms</label>
                    <textarea
                        value={patientData.symptoms}
                        required
                        onChange={(e) => handleInputChange("symptoms", e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 transition-colors resize-none"
                        placeholder="Describe any recent symptoms or concerns..."
                    />
                </div>
            </div>
        </div>
    );
};

export default PatientForm;
