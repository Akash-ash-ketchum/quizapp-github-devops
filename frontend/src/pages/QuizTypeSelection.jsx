import { useNavigate } from "react-router-dom";

const QuizTypeSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <h2 className="text-4xl font-bold mb-8">Select Quiz Type</h2>
      <div className="flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-8">
        {/* Topic-Based Quiz Button */}
        <button
          onClick={() => navigate("/topics")}
          className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg text-xl font-semibold shadow-lg transition duration-300"
        >
          Topic-Based Quiz
        </button>

        {/* Document-Based Quiz Button */}
        <button
          onClick={() => navigate("/document-quiz")}
          className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-lg text-xl font-semibold shadow-lg transition duration-300"
        >
          Document-Based Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizTypeSelection;
