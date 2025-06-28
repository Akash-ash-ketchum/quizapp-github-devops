const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-002:generateContent";

/**
 * Generates quiz questions using Gemini AI.
 * @param {string} content - The topic or extracted document text.
 * @param {number} numQuestions - Number of questions to generate.
 * @param {string} type - "topic" for topic-based, "document" for document-based.
 * @returns {Promise<Object>} - Object containing title and an array of questions.
 */
const generateQuizQuestions = async (content, numQuestions, type) => {
  try {
    console.log(`🔹 Generating ${type}-based quiz with ${numQuestions} questions...`);

    let prompt = "";

    if (type === "topic") {
      // ✅ Topic-Based Quiz Prompt (UNCHANGED)
      prompt = `Generate ${numQuestions} multiple-choice quiz questions on the topic "${content}". 
      Each question should have **exactly 4 answer choices**, with **one correct answer**.
      Return the quiz **only** as a valid JSON object in this format:

      {
        "title": "Quiz Title",
        "questions": [
          {
            "questionText": "What is X?",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": "B"
          },
          ...
        ]
      }`;
    } else if (type === "document") {
      // ✅ Document-Based Quiz Prompt (NEW)
      prompt = `You are an AI that strictly generates quiz questions from a given document.
      **DO NOT** generate questions beyond the content. Only ask **directly related** questions.
      
      Generate ${numQuestions} multiple-choice questions based on the document below.
      - Each question must have **exactly 4 options**.
      - Clearly indicate the correct answer.
      - **Return only a valid JSON object** (No explanations, extra text, or formatting).

      **Document Content**:
      "${content}"

      **Expected JSON Format**:
      {
        "title": "Document-Based Quiz",
        "questions": [
          {
            "questionText": "What is X?",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": "B"
          },
          ...
        ]
      }
      
      Now generate and return the JSON quiz.`;
    } else {
      throw new Error("Invalid quiz type specified.");
    }

    // ✅ Send Request to Gemini API
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] }
    );

    // ✅ Extract AI Response
    let generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!generatedText) {
      console.error("❌ No response from Gemini AI.");
      throw new Error("No questions generated");
    }

    console.log("🔹 Raw AI Response:", generatedText);

    // ✅ Remove unnecessary formatting (e.g., ```json ... ```)
    generatedText = generatedText.replace(/```json|```/g, "").trim();

    // ✅ Parse JSON Response
    let quizData;
    try {
      quizData = JSON.parse(generatedText);
    } catch (error) {
      console.error("❌ JSON Parsing Error:", error.message);
      throw new Error("Invalid JSON format received from Gemini API");
    }

    // ✅ Ensure Valid Response Structure
    if (!quizData.title) quizData.title = type === "topic" ? `${content} Quiz` : "Document-Based Quiz";
    if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      throw new Error("Invalid quiz format received from Gemini API");
    }

    // ✅ Ensure Field Names Are Correctly Mapped
    const formattedQuestions = quizData.questions.map(q => ({
      questionText: q.questionText || q.question || "Untitled Question",
      options: q.options || [],
      correctAnswer: q.correctAnswer || "",
    }));

    console.log("✅ Successfully Generated Questions:", formattedQuestions);

    return { title: quizData.title, questions: formattedQuestions };
  } catch (error) {
    console.error("❌ Gemini API Error:", error.response?.data || error.message);
    return { title: "Generated Quiz", questions: [] };
  }
};

module.exports = { generateQuizQuestions };
