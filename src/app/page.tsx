"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Sparkles, ArrowRight, Bot, Rocket, Globe } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero */}
      <div className="relative pt-32 pb-20 px-6">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[128px]" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 mb-8">
            <Sparkles className="w-4 h-4 text-purple-400" />
            AI-Powered Website Builder
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Build websites with{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              AI magic
            </span>
          </h1>

          <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10">
            Describe your vision, and our AI will generate a beautiful website for you.
            Deploy to Vercel with one click and share it with the world.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href={session ? "/dashboard" : "/signup"}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              {session ? "Go to Dashboard" : "Start Building"}{" "}
              <ArrowRight className="w-4 h-4" />
            </Link>
            {!session && (
              <Link
                href="/login"
                className="px-8 py-3.5 rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <Bot className="w-10 h-10 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">AI Chat Builder</h3>
            <p className="text-sm text-white/40">
              Describe what you want in natural language. The AI generates modern,
              responsive websites instantly.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <Rocket className="w-10 h-10 text-pink-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">One-Click Deploy</h3>
            <p className="text-sm text-white/40">
              Deploy your creation to Vercel instantly. Get a live URL to share with
              anyone, anywhere.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <Globe className="w-10 h-10 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Your Portfolio</h3>
            <p className="text-sm text-white/40">
              All your creations in one place. Build your portfolio of AI-generated
              websites and share them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
