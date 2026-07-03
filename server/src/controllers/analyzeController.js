import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

/**
 * Endpoint controller to analyze input research text using the Google Gemini API.
 * Enforces JSON output and validates requests.
 */
export const analyzeText = async (req, res) => {
  try {
    const { text } = req.body;

    // 1. Validate request payload
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: "Missing or invalid input. Please provide a non-empty 'text' field in the request body."
      });
    }

    // 2. Check API Key configuration
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Configuration Error: GEMINI_API_KEY is not defined in the environment variables.");
      return res.status(500).json({
        success: false,
        error: "Google Gemini API key is missing on the server. Please check environment configurations."
      });
    }

    // 3. Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // We use gemini-2.5-flash as it supports responseSchema for strict JSON structural outputs
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            summary: {
              type: "STRING",
              description: "A clean, objective, executive-level summary of the research text, strictly avoiding hallucinations."
            },
            keyPoints: {
              type: "ARRAY",
              items: { type: "STRING" },
              description: "A list of critical discoveries, statistics, or findings explicitly mentioned in the text."
            },
            weakClaims: {
              type: "ARRAY",
              items: { type: "STRING" },
              description: "Assertive statements, correlations treated as causations, or claims in the text that lack strong empirical support or clear methodologies."
            },
            recommendations: {
              type: "ARRAY",
              items: { type: "STRING" },
              description: "Pragmatic, actionable strategic recommendations or next steps based on the findings."
            },
            contentBrief: {
              type: "STRING",
              description: "A structured brief or draft structure to convey the core details to a technical audience."
            }
          },
          required: ["summary", "keyPoints", "weakClaims", "recommendations", "contentBrief"]
        }
      }
    });

    // 4. Formulate the prompt with strict objectivity instructions
    const prompt = `You are a professional research analyst assistant. Your task is to carefully analyze the provided research text and extract key metadata into a structured report.

CRITICAL DIRECTIVES FOR FACTUAL ACCURACY:
- Rely strictly on the information provided in the source text. Do NOT invent, assume, or extrapolate facts, percentages, dates, or details.
- Avoid all hallucinations. If a specific section (such as weak claims or recommendations) has no support in the text, return a brief factual note stating so, rather than speculating.
- For "weakClaims", objectively analyze the text for sweeping assumptions, small cohort groups, missing comparison models, or statements that are not fully validated by the provided data.

Source Text for Analysis:
"""
${text}
"""`;

    // 5. Generate content from Gemini
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // 6. Parse and return JSON payload
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parsing error on model output:", responseText, parseError);
      return res.status(500).json({
        success: false,
        error: "Failed to parse the AI analysis result due to formatting constraints."
      });
    }

    return res.status(200).json(parsedPayload);

  } catch (error) {
    console.error("Error communicating with Google Gemini API:", error);
    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred while communicating with the analysis engine."
    });
  }
};
