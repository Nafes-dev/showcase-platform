import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an AI website builder assistant. You help users create beautiful, modern web pages.

When a user describes what they want, you generate complete, self-contained HTML pages with inline CSS and JavaScript.

Guidelines:
- Generate modern, responsive HTML5 pages with Tailwind CSS (via CDN link)
- Use beautiful gradients, glassmorphism effects, and modern design patterns
- Include all styles inline or via Tailwind classes
- Make pages fully responsive
- Use placeholder images from picsum.photos or similar
- Include smooth animations and hover effects
- The generated code must be a complete, standalone HTML file

When generating code, wrap it in \`\`\`html code blocks.

When the user asks to modify something, regenerate the full page with the changes applied.

Available templates to reference:
- SaaS Landing Page (like Apex): Hero with video background, features grid, testimonials, CTA
- Agency Page (like Studio): Animated hero, partners section, services grid, team section
- AI Builder: Minimal hero-focused page with bold typography
- Velorah: Elegant, serif-based hero with video background

Help users customize colors, text, images, layouts, and sections.`;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, projectId, history } = await req.json();
    const userId = (session.user as any).id;

    // Save user message
    await prisma.message.create({
      data: {
        role: "user",
        content: message,
        userId,
        projectId: projectId || null,
      },
    });

    // Build message history for Claude
    const messages = [
      ...(history || []).map((msg: any) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user" as const, content: message },
    ];

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages,
    });

    const assistantMessage =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Save assistant message
    await prisma.message.create({
      data: {
        role: "assistant",
        content: assistantMessage,
        userId,
        projectId: projectId || null,
      },
    });

    // Extract HTML code if present
    const htmlMatch = assistantMessage.match(/```html\n([\s\S]*?)```/);
    const generatedCode = htmlMatch ? htmlMatch[1] : null;

    return NextResponse.json({
      message: assistantMessage,
      generatedCode,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
