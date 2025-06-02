import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import cvData from "../../../data/cv.json";

// Simple keyword-based response function
function generateFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("experience") || lowerMessage.includes("work")) {
    return `Jordi has ${cvData.experience.length} years of experience as a Product Designer. Currently, he's a ${cvData.experience[0].position} at ${cvData.experience[0].company} since ${cvData.experience[0].duration.split(" - ")[0]}. Previously, he worked as a ${cvData.experience[1].position} at ${cvData.experience[1].company}.`;
  }

  if (lowerMessage.includes("skill") || lowerMessage.includes("what can")) {
    return `Jordi specializes in ${cvData.skills.slice(0, 4).join(", ")} and more. His key skills include ${cvData.skills.join(", ")}.`;
  }

  if (lowerMessage.includes("project")) {
    const projectContent = cvData.projects
      .map((p) => {
        const slug = p.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

        let imageUrl = "";
        if (slug === "e-commerce-platform-redesign") {
          imageUrl =
            "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&q=80";
        } else if (slug === "mobile-banking-app") {
          imageUrl =
            "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&q=80";
        }

        return `<div style="margin: 16px 0; padding: 16px; border: 1px solid #e0e0e0; border-radius: 8px;">
          ${imageUrl ? `<img src="${imageUrl}" alt="${p.name}" style="width: 100%; max-width: 300px; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />` : ""}
          <h3><a href="/projects/${slug}" style="color: #0066cc; text-decoration: underline;">${p.name}</a></h3>
          <p style="margin: 4px 0; color: #666;">${p.description}</p>
        </div>`;
      })
      .join("");
    return `Jordi has worked on several notable projects:<br/><br/>${projectContent}<br/>Click on any project name to view detailed case studies with process, challenges, and results.`;
  }

  if (lowerMessage.includes("education") || lowerMessage.includes("study")) {
    return `Jordi graduated with a ${cvData.education[0].degree} from ${cvData.education[0].institution} in ${cvData.education[0].year}.`;
  }

  if (lowerMessage.includes("contact") || lowerMessage.includes("email")) {
    return `You can reach Jordi at ${cvData.email}. He's based in ${cvData.location}.`;
  }

  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return `Hello! I'm here to help you learn about ${cvData.name}, a ${cvData.title} based in ${cvData.location}. ${cvData.summary} Feel free to ask about his experience, skills, or projects!`;
  }

  // Default response
  return `Thanks for your question about ${cvData.name}! He's a ${cvData.title} with expertise in ${cvData.skills.slice(0, 3).join(", ")}. Currently working as ${cvData.experience[0].position} at ${cvData.experience[0].company}. Feel free to ask about his specific experience, skills, projects, or education!`;
}

// Track quota exhaustion to avoid repeated API calls
let quotaExhausted = false;
let lastQuotaCheck = 0;
const QUOTA_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      const fallbackResponse = generateFallbackResponse(message);
      return NextResponse.json({ response: fallbackResponse });
    }

    // Check if quota was recently exhausted and skip API call
    const now = Date.now();
    if (quotaExhausted && now - lastQuotaCheck < QUOTA_CHECK_INTERVAL) {
      console.log("Quota exhausted, using fallback response");
      const fallbackResponse = generateFallbackResponse(message);
      return NextResponse.json({ response: fallbackResponse });
    }

    const systemPrompt = `You are an AI assistant representing Jordi Poblet, a Product Designer. You have access to his CV and portfolio information. Answer questions about his background, experience, skills, and projects in a friendly and professional manner. Always respond as if you're representing Jordi.

Here is Jordi's CV information:
${JSON.stringify(cvData, null, 2)}

Guidelines:
- Be conversational and friendly
- Provide specific details from the CV when relevant
- When mentioning projects, include clickable links to detailed case studies using this format: <a href="/projects/[project-slug]" style="color: #0066cc; text-decoration: underline;">[Project Name]</a>
- Project slugs should be lowercase with hyphens: "E-commerce Platform Redesign" becomes "e-commerce-platform-redesign"
- If asked about something not in the CV, politely mention that you don't have that specific information
- Encourage users to reach out directly for more detailed discussions
- Keep responses concise but informative
- You can use HTML formatting in responses for links and basic styling`;

    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      // Reset quota exhaustion flag on successful API call
      quotaExhausted = false;

      const response =
        completion.choices[0]?.message?.content ||
        "Sorry, I could not generate a response.";

      return NextResponse.json({ response });
    } catch (openaiError: unknown) {
      console.warn(
        "OpenAI API error, using fallback:",
        (openaiError as Error).message,
      );

      // Check if it's a quota error and set flag
      if (
        (openaiError as unknown as { status?: number }).status === 429 ||
        (openaiError as Error).message?.includes("quota")
      ) {
        quotaExhausted = true;
        lastQuotaCheck = now;
        console.log("Quota exhausted, will use fallback for next 5 minutes");
      }

      // Use fallback response when OpenAI API fails
      const fallbackResponse = generateFallbackResponse(message);
      return NextResponse.json({ response: fallbackResponse });
    }
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process your request" },
      { status: 500 },
    );
  }
}
