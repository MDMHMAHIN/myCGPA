import { GoogleGenAI } from "@google/genai";
import { AcademicRecord } from "../types";

// ============================================================================
// 🔑 FREE API KEY CONFIGURATION
// ============================================================================
// Google Gemini provides a generous FREE TIER for this API.
// You do NOT need to pay.
// 
// 1. Go to: https://aistudio.google.com/app/apikey
// 2. Click "Create API Key"
// 3. Paste it inside the quotes below.
// ============================================================================
const HARDCODED_API_KEY = "AIzaSyBe5BOdTnaTnYr3KZKilK-SdrxTNkKokaA"; // <--- PASTE_YOUR_FREE_API_KEY_HERE

// Logic to select the best available key (Hardcoded > Environment Variable)
const getApiKey = () => {
  if (HARDCODED_API_KEY) return HARDCODED_API_KEY;
  
  // Safe check for process.env (Node/Webpack environments)
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore error if process is not defined
  }
  
  return '';
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

export const generateAcademicInsights = async (record: AcademicRecord): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please open 'services/geminiService.ts' and paste your FREE API Key in the HARDCODED_API_KEY variable.";
  }

  try {
    // Construct a prompt based on the user's data
    const semesterSummaries = record.semesters.map(s => {
      const totalCredits = s.courses.reduce((acc, c) => acc + c.credits, 0);
      const totalPoints = s.courses.reduce((acc, c) => acc + (c.credits * c.grade), 0);
      const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
      const coursesList = s.courses.map(c => `${c.name}: ${c.grade} (${c.credits} cr)`).join(", ");
      return `Semester: ${s.name}, GPA: ${gpa}, Courses: [${coursesList}]`;
    }).join("\n");

    const prompt = `
      You are an expert academic advisor. Analyze the following academic record for a university student.
      Provide a brief, encouraging summary of their performance trend (CGPA).
      Identify any specific weak areas if visible (low grades in specific types of courses).
      Give 3 actionable tips to improve their GPA in the next semester.
      
      Data:
      ${semesterSummaries}
      
      Keep the tone professional, motivating, and concise (under 200 words).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    return response.text || "Could not generate insights at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while analyzing your data. Please check your internet connection or verify your API Key.";
  }
};