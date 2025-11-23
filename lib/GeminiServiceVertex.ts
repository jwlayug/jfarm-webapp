
import { getVertexAI, getGenerativeModel } from "firebase/vertexai";
import { app } from "./firebase";

/**
 * Service for Firebase Vertex AI Integration.
 * Use this when running locally with Firebase Auth/App Check.
 */
export class GeminiServiceVertex {
  
  constructor() {}

  async askAssistant(userPrompt: string, systemContext: string): Promise<string> {
    try {
      // Initialize Vertex AI service with the existing Firebase app instance
      const vertexAI = getVertexAI(app);

      // Initialize the generative model
      // Ensure 'gemini-1.5-flash' is enabled in your Firebase Console -> Vertex AI
      const model = getGenerativeModel(vertexAI, {
        model: 'gemini-1.5-flash',
        systemInstruction: `You are JFarm Assistant, an expert agricultural financial analyst for a sugarcane farm.
          
          Here is the current real-time database state:
          ${systemContext}
          
          BUSINESS LOGIC & FORMULAS:
          1. **Total Income** = (Sugarcane Price * Bags) + (Molasses Price * Molasses Kilos/Tons)
          2. **Total Expenses** = (Tons * Group Wage Rate) + Driver Tip + Other Expenses
          3. **Net Profit** = Total Income - Total Expenses
          
          RESPONSE RULES:
          1. Answer specifically based on the provided data. Do not hallucinate data not present.
          2. Use **Markdown Tables** when listing items (Travels, Employees, Debts).
          3. For financial questions, always show the math based on the formulas above.
          4. Be concise and professional.
          5. Currencies are in Philippine Peso (PHP/₱).
          `
      });

      // Generate content
      const result = await model.generateContent(userPrompt);
      const response = result.response;
      const text = response.text();
      
      return text || "I couldn't generate a response.";

    } catch (error: any) {
      console.error("Firebase Vertex AI Error:", error);
      
      if (error.message && (error.message.includes("Vertex AI") || error.message.includes("403"))) {
        return "Access Denied: Please ensure the **Vertex AI API** is enabled in your Firebase Console and your project has a valid billing account (Blaze plan).";
      }
      
      return `I encountered an error. \n\nDetails: ${error.message || 'Unknown error'}`;
    }
  }
}

export const geminiService = new GeminiServiceVertex();
