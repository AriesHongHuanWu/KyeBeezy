
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { prompt, action, context } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "Internal Error: API Key missing. Please add GEMINI_API_KEY to .env.local" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        let systemInstruction = "";
        switch (action) {
            case "fix":
                systemInstruction = "You are a professional editor. Fix grammar, spelling, and punctuation errors in the following text. Return ONLY the corrected text, do not add any conversational filler. Keep the original markdown formatting if present.";
                break;
            case "improve":
                systemInstruction = "You are a professional writer. Improve the flow, vocabulary, and tone of the following text to make it more engaging and professional. Return ONLY the improved text. Keep markdown formatting.";
                break;
            case "summary":
                systemInstruction = "Summarize the following text into a concise, engaging snippet suitable for a news feed card (max 2-3 sentences).";
                break;
            case "expand":
                systemInstruction = "Expand upon the following point or short text, adding relevant details and professional context. Keep it concise but informative.";
                break;
            case "hype":
                systemInstruction = "Rewrite the following text to sound exciting, energetic, and 'hyped up' for a younger audience (Gen Z / Musicians). Use emojis sparingly but effectively.";
                break;
            case "continue":
                systemInstruction = `Continue writing the following article based on the context. Maintain the style and tone. \n\nContext so far: ${context?.substring(context.length - 500) || ""}`;
                break;
            default:
                systemInstruction = "Help with the following text.";
        }

        const finalPrompt = `${systemInstruction}\n\nInput Text:\n${prompt}`;

        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ result: text });
    } catch (error) {
        console.error("AI Generation Error:", error);
        return NextResponse.json(
            { error: "Failed to generate content." },
            { status: 500 }
        );
    }
}
