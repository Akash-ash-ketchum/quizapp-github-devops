import { Routes, Route } from "react-router-dom";
import LoginSignup from "./pages/LoginSignup";
import Profile from "./pages/Profile";
import TopicSelection from "./pages/TopicSelection";
import Quiz from "./pages/Quiz";
import DocumentQuiz from "./pages/DocumentQuiz"; // ✅ Import Document-Based Quiz Page
import QuizTypeSelection from "./pages/QuizTypeSelection"; // ✅ Import Quiz Type Selection Page
import ProtectedRoute from "./context/ProtectedRoute";
import Navbar from "./pages/Navbar";
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/quiz-type" element={<ProtectedRoute><QuizTypeSelection /></ProtectedRoute>} /> {/* ✅ New Route */}
        <Route path="/topics" element={<ProtectedRoute><TopicSelection /></ProtectedRoute>} />
        <Route path="/quiz/:topic" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/document-quiz" element={<ProtectedRoute><DocumentQuiz /></ProtectedRoute>} /> {/* ✅ New Route */}
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard />
        </ProtectedRoute>} />
      </Routes>
    </>
  );
};

export default App;
