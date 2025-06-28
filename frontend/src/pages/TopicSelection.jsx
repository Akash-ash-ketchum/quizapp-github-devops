import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TopicSelection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [questionLimit, setQuestionLimit] = useState(""); // ✅ New state for question limit
  const navigate = useNavigate();

  // ✅ Suggested topics for convenience
  const suggestedTopics = [
    "Math",
    "Science",
    "History",
    "Geography",
    "Technology",
    "Physics",
    "Chemistry",
    "Biology",
    "Artificial Intelligence",
    "Space Exploration",
    "Cybersecurity",
    "Machine Learning",
  ];

  // ✅ Ensure question limit is within the range (5-20) & default to 5
  const getValidQuestionLimit = () => {
    const num = Number(questionLimit);
    return num >= 5 && num <= 20 ? num : 5;
  };

  const handleTopicSelect = (topic) => {
    const numQuestions = getValidQuestionLimit(); // ✅ Get valid question count
    navigate(`/quiz/${topic}?numQuestions=${numQuestions}`); // ✅ Pass topic & question limit
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      const numQuestions = getValidQuestionLimit();
      navigate(`/quiz/${searchTerm.trim()}?numQuestions=${numQuestions}`); // ✅ Pass to quiz page
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h2 className="text-3xl font-bold text-blue-600 mb-6">Select a Quiz Topic</h2>

      {/* ✅ Search Input */}
      <form onSubmit={handleSearchSubmit} className="w-full max-w-md text-center">
        <input
          type="text"
          placeholder="Type any topic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        
        {/* ✅ Question Limit Input */}
        <input
          type="number"
          placeholder="Number of questions (5-20)"
          value={questionLimit}
          onChange={(e) => setQuestionLimit(e.target.value)}
          min="5"
          max="20"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Search
        </button>
      </form>

      {/* ✅ Suggested Topics */}
      <p className="mt-4 text-gray-500">Or select a topic:</p>
      <div className="grid grid-cols-2 gap-4 mt-4 max-w-md">
        {suggestedTopics.map((topic) => (
          <button
            key={topic}
            onClick={() => handleTopicSelect(topic)}
            className="px-6 py-3 text-lg font-semibold rounded-lg bg-white text-gray-700 shadow-lg hover:bg-blue-500 hover:text-white transition-all duration-300"
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopicSelection;
