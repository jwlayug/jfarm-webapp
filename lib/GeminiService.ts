
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // In the preview environment, this uses the injected API key.
    // For local use with Google GenAI, ensure PROCESS.ENV.API_KEY is set.
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async askAssistant(userPrompt: string, systemContext: string): Promise<string> {
    try {
      const model = this.ai.models;
      
      const response = await model.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
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
        }
      });

      return response.text || "I couldn't generate a response.";

    } catch (error: any) {
      console.error("AI Service Error:", error);
      return `I encountered an error. Details: ${error.message || 'Unknown error'}`;
    }
  }
}

export const geminiService = new GeminiService();
