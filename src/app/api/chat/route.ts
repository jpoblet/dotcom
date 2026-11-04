import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  buildKnowledgeBase,
  getCurrentRole,
  getEducation,
  getProfile,
  getProjects,
} from "@/lib/content";

// Fallback response when the AI provider is unavailable
function generateFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  const profile = getProfile();
  const current = getCurrentRole();

  if (lowerMessage.includes("experience") || lowerMessage.includes("work")) {
    return current
      ? `Jordi is currently ${current.role} at ${current.company}.`
      : `Jordi is a ${profile.title}.`;
  }

  if (lowerMessage.includes("skill")) {
    return `Jordi's key skills include ${profile.skills.slice(0, 5).join(", ")}.`;
  }

  if (lowerMessage.includes("project")) {
    const projects = getProjects()
      .map((p) => (p.draft ? p.name : `<a href="/projects/${p.slug}">${p.name}</a>`))
      .join(", ");
    return `Jordi has worked on projects including: ${projects}.`;
  }

  if (lowerMessage.includes("education")) {
    const first = getEducation().at(-1);
    return first
      ? `Jordi studied ${first.degree} at ${first.institution}.`
      : `You can reach Jordi at ${profile.email}.`;
  }

  if (lowerMessage.includes("contact") || lowerMessage.includes("email")) {
    return `You can reach Jordi at ${profile.email}. He's based in ${profile.location}.`;
  }

  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return `Hello! I'm here to help you learn about ${profile.name}, a ${profile.title} based in ${profile.location}. Feel free to ask about his experience, skills, or projects!`;
  }

  return `Thanks for your question about ${profile.name}! He's a ${profile.title} with expertise in ${profile.skills.slice(0, 3).join(", ")}. Feel free to ask about his experience, skills, projects, or education!`;
}

function buildSystemPrompt(): string {
  const profile = getProfile();
  return `You are ${profile.name}, ${profile.title}. Give sharp, relevant responses that provide meaningful detail without being verbose. Keep responses to a maximum of 3 sentences.

Knowledge base:
${buildKnowledgeBase()}

Instructions:
- Speak in first person as ${profile.name.split(" ")[0]}
- Provide enough detail to be helpful and informative
- Be direct and engaging - avoid corporate speak
- Include specific examples, metrics, or context when relevant
- Only link to a project when the knowledge base gives it a page, like: <a href="/projects/project-slug">Project Name</a>
- Focus on what matters most to the question
- Show personality while staying professional
- Maximum 3 sentences per response`;
}

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
          { role: "system", content: buildSystemPrompt() },
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
