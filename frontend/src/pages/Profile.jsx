import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import demo from "./demo.jpg";
import axios from "axios";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState("Quiz Stats");
  const [quizHistory, setQuizHistory] = useState([]);
  const [loginActivity, setLoginActivity] = useState([]);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user) {
          const res = await axios.get(`http://localhost:5000/api/users/${user._id}/attempts`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          setQuizHistory(res.data.quizAttempts || []);
          
          const lastFiveLogins = (res.data.loginActivity || [])
            .map(timestamp => new Date(timestamp).toLocaleString())
            .reverse(); // Newest first
          
          setLoginActivity(lastFiveLogins);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        navigate("/");
      }
    };

  fetchUserData();
}, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Calculate Stats
  const totalAttempts = quizHistory.length;
  const averageScore = quizHistory.length > 0
    ? (quizHistory.reduce((sum, quiz) => sum + quiz.score, 0) / quizHistory.length).toFixed(1)
    : "N/A";
  const bestPerformance = quizHistory.length
    ? Math.max(...quizHistory.map((quiz) => quiz.score))
    : "N/A";

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      {/* Left Sidebar */}
      <div className="w-1/4 bg-gray-800 p-6 flex flex-col items-center border-r border-gray-700 relative">
        <img
          src={demo}
          alt="Profile"
          className="w-32 h-32 rounded-full border-4 border-gray-500 shadow-md object-cover"
        />
        <h2 className="mt-4 text-2xl font-bold">{user?.name || "N/A"}</h2>
        <p className="text-gray-400">{user?.email || "N/A"}</p>

        {/* Sidebar Menu */}
        <div className="mt-6 w-full">
          {["Quiz Stats", "Recent Quizzes", "Activity Log"].map((section) => (
            <button
              key={section}
              onClick={() => setSelectedSection(section)}
              className={`w-full text-left px-6 py-3 rounded-lg transition-all text-lg ${
                selectedSection === section ? "bg-blue-600 text-white" : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              {section}
            </button>
          ))}
        </div>

        <button
          onClick={logout}
          className="mt-auto bg-red-500 px-6 py-2 rounded-lg hover:bg-red-600 transition text-lg w-full absolute bottom-6"
        >
          Logout
        </button>
      </div>

      {/* Right Content Section */}
      <div className="w-3/4 p-8">
        {selectedSection === "Quiz Stats" && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-4">Quiz Stats</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gray-700 p-4 rounded-lg shadow-md text-center">
                <p className="text-lg font-bold text-blue-400">{totalAttempts}</p>
                <p className="text-gray-300">Total Quiz Attempts</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg shadow-md text-center">
                <p className="text-lg font-bold text-green-400">{averageScore}</p>
                <p className="text-gray-300">Average Score</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg shadow-md text-center">
                <p className="text-lg font-bold text-yellow-400">{bestPerformance}</p>
                <p className="text-gray-300">Best Performance</p>
              </div>
            </div>
          </div>
        )}

        {selectedSection === "Recent Quizzes" && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold">Recent Quiz Topics</h3>
            <ul className="mt-4">
              {quizHistory.slice(0, 5).map((quiz, index) => (
                <li
                  key={index}
                  className="p-4 bg-gray-700 rounded-lg shadow-md mb-2 cursor-pointer hover:bg-blue-500 transition"
                >
                  <p className="text-lg font-semibold">
                    {quiz.quizType === "topic" ? quiz.topic : "Document Quiz"}
                  </p>
                  <p className="text-gray-300">Score: {quiz.score} / {quiz.totalQuestions}</p>
                  <p className="text-gray-400 text-sm">
                    Date: {new Date(quiz.date).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {selectedSection === "Activity Log" && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold">Activity Log</h3>
            <ul className="mt-4">
              {loginActivity.slice(0, 5).map((log, index) => (
                <li
                  key={index}
                  className="p-4 bg-gray-700 rounded-lg shadow-md mb-2 text-gray-300"
                >
                  {log}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;