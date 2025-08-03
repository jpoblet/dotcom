import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import cvData from "../../../data/cv.json";

// Fallback response when OpenAI is unavailable
function generateFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("experience") || lowerMessage.includes("work")) {
    return `Jordi has experience as a Product Designer. Currently, he's a ${cvData.experience[0].position} at ${cvData.experience[0].company}.`;
  }

  if (lowerMessage.includes("skill")) {
    return `Jordi's key skills include ${cvData.skills.slice(0, 5).join(", ")}.`;
  }

  if (lowerMessage.includes("project")) {
    const projectLinks = cvData.projects
      .map((p) => {
        const slug = p.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
        return `<a href="/projects/${slug}" style="color: #0066cc; text-decoration: underline;">${p.name}</a>`;
      })
      .join(", ");
    return `Jordi has worked on projects including: ${projectLinks}.`;
  }

  if (lowerMessage.includes("education")) {
    return `Jordi studied ${cvData.education[0].degree} at ${cvData.education[0].institution}.`;
  }

  if (lowerMessage.includes("contact") || lowerMessage.includes("email")) {
    return `You can reach Jordi at ${cvData.email}. He's based in ${cvData.location}.`;
  }

  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return `Hello! I'm here to help you learn about ${cvData.name}, a ${cvData.title} based in ${cvData.location}. Feel free to ask about his experience, skills, or projects!`;
  }

  return `Thanks for your question about ${cvData.name}! He's a ${cvData.title} with expertise in ${cvData.skills.slice(0, 3).join(", ")}. Feel free to ask about his experience, skills, projects, or education!`;
}

const systemPrompt = `You are Jordi Poblet, a Product Designer. Give sharp, relevant responses that provide meaningful detail without being verbose. Keep responses to a maximum of 3 sentences.

CV Data:
${JSON.stringify(cvData, null, 2)}

Instructions:
- Speak in first person as Jordi
- Provide enough detail to be helpful and informative
- Be direct and engaging - avoid corporate speak
- Include specific examples, metrics, or context when relevant
- For projects, create links like: <a href="/projects/project-slug" style="color: #0066cc; text-decoration: underline;">Project Name</a>
- Focus on what matters most to the question
- Show personality while staying professional
- Maximum 3 sentences per response`;

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    // Check if OpenAI API key is properly configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn(
        "OpenAI API key is not configured. Using fallback responses.",
      );
      return NextResponse.json({
        response: generateFallbackResponse(message),
        warning: "OpenAI API key not configured - using basic responses",
      });
    }

    // Validate API key format
    if (!process.env.OPENAI_API_KEY.startsWith("sk-")) {
      console.error("Invalid OpenAI API key format detected");
      return NextResponse.json(
        {
          error:
            "OpenAI API key appears to be invalid. Please check your configuration.",
        },
        { status: 500 },
      );
    }

    // Try OpenAI API
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const response =
        completion.choices[0]?.message?.content ||
        "Sorry, I could not generate a response.";
      return NextResponse.json({ response });
    } catch (openaiError) {
      console.warn(
        "OpenAI API error, using fallback:",
        (openaiError as Error).message,
      );
      return NextResponse.json({ response: generateFallbackResponse(message) });
    }
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process your request" },
      { status: 500 },
    );
  }
}
