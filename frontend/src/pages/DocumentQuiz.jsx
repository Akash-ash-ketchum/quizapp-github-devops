import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DocumentQuiz = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = "http://192.168.1.6:5000/api/quiz/generate-document";
  const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];

  // ✅ Handle file selection & validation
  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;
    if (!allowedTypes.includes(file.type)) {
      setError("❌ Invalid file type! Only PDF, DOCX, and TXT are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("❌ File is too large! Maximum allowed size is 5MB.");
      return;
    }

    setError("");
    setSelectedFile(file);
    setFilePreview("");

    // ✅ Read first few lines if it's a TXT file
    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result.split("\n").slice(0, 5).join("\n");
        setFilePreview(text);
      };
      reader.readAsText(file);
    }
  };

  // ✅ Handle document upload & quiz generation
  const handleGenerateQuiz = async () => {
  //   if (!selectedFile) return;

    const token = localStorage.getItem("token"); // ✅ Fetch token from localStorage
    if (!token) {
      setError("❌ Access Denied: You must be logged in to generate a quiz.");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("numQuestions", 5);

    try {
      const response = await axios.post(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.quiz && response.data.quiz._id) {
        const quizId = response.data.quiz._id;
        console.log("✅ Quiz Generated with ID:", quizId);
        navigate(`/quiz/document-based?id=${quizId}`); // ✅ Redirect to quiz page
      } else {
        throw new Error("Quiz generation failed. Try again.");
      }
    } catch (error) {
      setError(error.response?.data?.message || "❌ Failed to generate quiz.");
    } finally {
      setUploading(false);
    }
   };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <h2 className="text-4xl font-bold mb-8">Upload a Document for Quiz</h2>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <label className="w-96 h-40 border-2 border-dashed border-gray-500 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-gray-800 hover:bg-gray-700 transition">
        <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
        <p className="text-lg text-gray-300">Click to upload or drag & drop</p>
        <p className="text-sm text-gray-400">(Accepted: PDF, DOCX, TXT, Max 5MB)</p>
      </label>

      {selectedFile && <p className="mt-4 text-green-400">{selectedFile.name}</p>}

      {filePreview && (
        <div className="bg-gray-800 p-4 mt-4 rounded-lg w-96 max-h-32 overflow-auto text-gray-300">
          <p className="text-sm">📄 Preview:</p>
          <pre className="text-xs whitespace-pre-wrap">{filePreview}</pre>
        </div>
      )}

      {uploading && <p className="mt-4 text-blue-400">⏳ Uploading... Please wait.</p>}

      <button
        onClick={handleGenerateQuiz}
        disabled={!selectedFile || uploading}
        className="mt-6 bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg text-xl font-semibold shadow-lg transition duration-300 disabled:opacity-50"
      >
        {uploading ? "Processing..." : "Generate Quiz"}
      </button>
    </div>
  );
};

export default DocumentQuiz;
