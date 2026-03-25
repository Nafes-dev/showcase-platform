"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  User,
  Globe,
  Rocket,
  ExternalLink,
  Loader2,
  Calendar,
  Trash2,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  generatedCode: string;
  deployed: boolean;
  vercelUrl: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchProjects();
    }
  }, [session]);

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    if (res.ok) {
      setProjects(await res.json());
    }
    setLoading(false);
  };

  const deployProject = async (projectId: string) => {
    setDeploying(projectId);
    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Deployed!\n\nURL: ${data.url}`);
        fetchProjects();
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch {
      alert("Deploy failed");
    }
    setDeploying(null);
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      fetchProjects();
    } catch {
      alert("Failed to delete");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {session?.user?.name}
            </h1>
            <p className="text-white/40">{session?.user?.email}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-white/50">
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4" /> {projects.length} creations
              </span>
              <span className="flex items-center gap-1">
                <Rocket className="w-4 h-4" />{" "}
                {projects.filter((p) => p.deployed).length} deployed
              </span>
            </div>
          </div>
        </div>

        {/* Creations */}
        <h2 className="text-xl font-semibold text-white mb-6">Your Creations</h2>

        {projects.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No creations yet. Go to the dashboard to build your first website!</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm"
            >
              Start Building
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-colors"
              >
                {/* Preview */}
                <div className="h-48 bg-white relative overflow-hidden">
                  <iframe
                    srcDoc={project.generatedCode}
                    className="w-full h-full border-0 pointer-events-none"
                    style={{ transform: "scale(0.5)", transformOrigin: "top left", width: "200%", height: "200%" }}
                    title={project.name}
                  />
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">{project.name}</h3>
                    {project.deployed && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                        Live
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-white/30 mb-3">
                    <Calendar className="w-3 h-3" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-2">
                    {project.vercelUrl ? (
                      <a
                        href={project.vercelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Visit Site
                      </a>
                    ) : (
                      <button
                        onClick={() => deployProject(project.id)}
                        disabled={deploying === project.id}
                        className="flex-1 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {deploying === project.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Rocket className="w-3.5 h-3.5" />
                        )}
                        Deploy to Vercel
                      </button>
                    )}
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="py-2 px-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
