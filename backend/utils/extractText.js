const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const path = require("path");

// Extract text from different file types
const extractText = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (ext === ".docx") {
      const data = await mammoth.extractRawText({ path: filePath });
      return data.value;
    } else if (ext === ".txt") {
      return fs.readFileSync(filePath, "utf-8");
    } else {
      throw new Error("Unsupported file format");
    }
  } catch (error) {
    console.error("Error extracting text:", error);
    throw error;
  }
};

module.exports = extractText;
