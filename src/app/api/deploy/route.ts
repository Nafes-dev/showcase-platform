import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!VERCEL_TOKEN) {
      return NextResponse.json(
        { error: "Vercel token not configured" },
        { status: 500 }
      );
    }

    const userId = (session.user as any).id;
    const { projectId } = await req.json();

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Sanitize project name for Vercel (lowercase, alphanumeric, hyphens only)
    const sanitizedName = project.name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50);
    const vercelProjectName = `showcase-${sanitizedName}-${project.id.substring(0, 8)}`;

    // Create the deployment using Vercel API v13
    const teamQuery = VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : "";

    const deployResponse = await fetch(
      `https://api.vercel.com/v13/deployments${teamQuery}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: vercelProjectName,
          files: [
            {
              file: "index.html",
              data: Buffer.from(project.generatedCode).toString("base64"),
              encoding: "base64",
            },
          ],
          projectSettings: {
            framework: null,
          },
          target: "production",
        }),
      }
    );

    if (!deployResponse.ok) {
      const errorData = await deployResponse.json();
      console.error("Vercel deploy error:", errorData);
      return NextResponse.json(
        { error: "Failed to deploy to Vercel", details: errorData },
        { status: 500 }
      );
    }

    const deployData = await deployResponse.json();
    const vercelUrl = `https://${deployData.url}`;

    // Update project with Vercel info
    await prisma.project.update({
      where: { id: projectId },
      data: {
        deployed: true,
        vercelProjectId: deployData.projectId || vercelProjectName,
        vercelUrl,
      },
    });

    return NextResponse.json({
      success: true,
      url: vercelUrl,
      deploymentId: deployData.id,
    });
  } catch (error) {
    console.error("Deploy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
