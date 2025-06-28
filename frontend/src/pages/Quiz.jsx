import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const TIMER_DURATION = 30;

const Quiz = () => {
  const { topic } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasFetched = useRef(false); // Add this ref to track fetch status

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [loading, setLoading] = useState(true);
  const [timesUp, setTimesUp] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState(null);

  const numQuestions = Number(searchParams.get("numQuestions")) || 5;
  const quizId = searchParams.get("id");

  useEffect(() => {
    if (hasFetched.current) return; // Prevent duplicate fetches
    hasFetched.current = true;
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        let response;
        if (quizId) {
          response = await axios.get(`http://localhost:5000/api/quiz/${quizId}`);
        } else {
          response = await axios.post(
            `http://localhost:5000/api/quiz/generate`,
            { topic, numQuestions },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        }

        const quizData = response.data.quiz || response.data;
        if (!quizData.questions || quizData.questions.length === 0) {
          throw new Error("No quiz questions found.");
        }

        setQuestions(quizData.questions);
      } catch (error) {
        console.error("❌ Error fetching quiz:", error);
        setError("Failed to load quiz. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [topic, numQuestions, quizId]);

  useEffect(() => {
    if (timeLeft === 0) {
      setTimesUp(true);
      setTimeout(() => {
        setTimesUp(false);
        handleNextQuestion(true);
      }, 1000);
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswerClick = (option) => {
    if (timeLeft > 0 && !timesUp) {
      setSelectedAnswer(option);
    }
  };

  // In the saveQuizAttempt function, use the same scoring logic as results page:
  const handleNextQuestion = (timeExpired = false) => {
    // Create the new answer immediately (don't wait for state update)
    const newAnswer = {
      question: questions[currentQuestionIndex]?.questionText || "Unknown Question",
      selectedAnswer: selectedAnswer || (timeExpired ? "No Answer" : ""),
      correctAnswer: questions[currentQuestionIndex]?.correctAnswer || "Unknown Answer",
    };
  
    // Calculate the new answers array immediately
    const newAnswers = [...answers, newAnswer];
  
    if (!timeExpired && selectedAnswer === questions[currentQuestionIndex]?.correctAnswer) {
      setScore((prevScore) => prevScore + 1);
    }
  
    if (currentQuestionIndex < questions.length - 1) {
      // Update state normally for next question
      setAnswers(newAnswers);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setTimeLeft(TIMER_DURATION);
    } else {
      // For final question:
      // 1. Update answers state
      setAnswers(newAnswers);
      // 2. Mark as completed
      setQuizCompleted(true);
      // 3. Save with the CORRECT answers array
      saveQuizAttempt(newAnswers);
    }
  };
  
  // Updated saveQuizAttempt to accept answers as parameter
  const saveQuizAttempt = async (answersToSave = answers) => {
    try {
      const finalScore = answersToSave.filter(a => a.selectedAnswer === a.correctAnswer).length;
      
      await axios.post(
        'http://localhost:5000/api/users/attempts',
        {
          quizType: quizId ? 'document' : 'topic',
          topic: quizId ? 'Document Quiz' : topic,
          score: finalScore,
          totalQuestions: questions.length,
          quizId: quizId || undefined,
        },
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          },
        }
      );
    } catch (err) {
      console.error("Failed to save quiz attempt:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">Loading Questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6 py-12">
      <div className="bg-white p-12 rounded-lg shadow-lg w-full max-w-4xl min-h-[500px] flex flex-col justify-center items-center">
        {!quizCompleted ? (
          <>
            <h2 className="text-4xl font-bold text-blue-600 mb-6">{`${topic} Quiz`}</h2>

            <p className={`text-xl font-semibold mb-4 ${timesUp ? "text-red-600 animate-pulse" : "text-red-500"}`}>
              {timesUp ? "Time's Up!" : `Time Left: ${timeLeft}s`}
            </p>

            <p className="text-2xl font-semibold text-gray-800 text-center mb-8">
              {questions[currentQuestionIndex]?.questionText || "Loading question..."}
            </p>

            <div className="w-full max-w-2xl flex flex-col space-y-6">
              {questions[currentQuestionIndex]?.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(option)}
                  className={`w-full py-4 rounded-lg text-xl font-medium border transition ${
                    selectedAnswer === option ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-blue-100"
                  }`}
                  disabled={timeLeft === 0 || timesUp}
                >
                  {option}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextQuestion}
              disabled={!selectedAnswer && timeLeft > 0}
              className="mt-8 bg-blue-600 text-white px-8 py-4 rounded-lg text-xl disabled:opacity-50"
            >
              {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
            </button>
          </>
        ) : (
          <div className="w-full text-center">
            <h2 className="text-4xl font-bold text-green-600">Quiz Completed!</h2>
            <p className="text-2xl font-semibold mt-6">
              Your Score: {answers.filter(a => a.selectedAnswer === a.correctAnswer).length} / {questions.length}
            </p>

            <div className="mt-6 bg-gray-100 p-6 rounded-lg w-full">
              <h3 className="text-2xl font-bold text-gray-700">Review Your Answers</h3>
              <ul className="mt-4 space-y-4">
                {answers.map((answer, index) => (
                  <li key={index} className="p-4 rounded-lg shadow-md bg-white">
                    <p className="text-lg font-medium">{answer.question}</p>
                    <p className={`mt-2 text-lg ${answer.selectedAnswer === answer.correctAnswer ? "text-green-600" : "text-red-600"}`}>
                      Your Answer: {answer.selectedAnswer}
                    </p>
                    {answer.selectedAnswer !== answer.correctAnswer && (
                      <p className="text-lg text-blue-600">Correct Answer: {answer.correctAnswer}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button 
                onClick={() => navigate("/profile")} 
                className="bg-purple-600 text-white px-8 py-4 rounded-lg text-xl hover:bg-purple-700"
              >
                View Profile
              </button>
              <button 
                onClick={() => navigate("/quiz-type")} 
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl hover:bg-blue-700"
              >
                Take Another Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;