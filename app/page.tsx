'use client';

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import logo from '@/public/logo.png';
import Marquee from "react-fast-marquee";
import anthropic_logo from "@/public/logos/anthropic.png"
import gemini_logo from "@/public/logos/gemini.png"
import meta_logo from "@/public/logos/meta.png"
import openai_logo from "@/public/logos/openai.png"
import microsoft_logo from "@/public/logos/microsoft.png"
import crewai_logo from "@/public/logos/crewai.png"
import langchain_logo from "@/public/logos/langchain.png"

export default function LandingPage() {
  useEffect(() => {
    document.title = "Agentec | Next-Gen Agent Management";
  }, []);

  return (
    <main className="relative min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Blurred Animated Gradient Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -inset-20 w-full h-full animate-gradientLoop bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-30 blur-3xl" />
      </div>

      {/* Sticky Floating Navbar */}
      <nav className="fixed top-4 left-1/2 w-4/5 -translate-x-1/2 z-50 bg-[#121212]/80 backdrop-blur-lg border border-neutral-800 shadow-xl rounded-full px-8 py-4 flex items-center justify-between gap-8 text-sm font-medium text-gray-200">
        <span className="text-white font-bold tracking-wide">
          <Image src={logo} alt="logo" className="aspect-auto w-32" />
        </span>
        <div className="flex gap-6">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#cta" className="hover:text-white transition-colors">Get Started</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center h-screen">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="py-4 text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent animate-text-gradient"
        >
          Supercharge Your Agents
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="mt-6 max-w-xl text-lg md:text-xl text-gray-300"
        >
          Agentec helps you manage, onboard, and monitor all your AI agents with ease — built for the modern stack.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.3, delay: 0.4 }}
          className="mt-10"
        >
          <Button size="lg" className="text-lg font-bold gap-2 px-8 py-6 bg-white text-black hover:scale-105 hover:bg-gray-300 transition-transform">
            Get started for free <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-24 bg-[#0c0c0c]/80">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-10">Why Choose Agentec?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
            <div className="bg-[#1a1a1a]/80 p-6 rounded-2xl shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">1. Lightning Onboarding</h3>
              <p className="text-gray-400">Upload, configure, and deploy agents in seconds with our guided setup wizard.</p>
            </div>
            <div className="bg-[#1a1a1a]/80 p-6 rounded-2xl shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">2. Real-time Monitoring</h3>
              <p className="text-gray-400">Track agent status, logs, and performance metrics in a beautiful dashboard.</p>
            </div>
            <div className="bg-[#1a1a1a]/80 p-6 rounded-2xl shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">3. API-first Architecture</h3>
              <p className="text-gray-400">Seamlessly integrate with your stack using our secure REST & GraphQL APIs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Marquee Section */}
      <section className="relative z-10 py-12 bg-[#0a0a0a]">
        <h3 className="text-center text-sm uppercase tracking-widest text-gray-400 mb-16">
          Trusted by leading teams
        </h3>
        <Marquee gradient={false} speed={60} pauseOnHover className="flex gap-20">
          {[
            anthropic_logo,
            gemini_logo,
            meta_logo,
            openai_logo,
            langchain_logo,
            microsoft_logo,
            crewai_logo
          ].map((src, i) => (
            <div key={i} className="mx-16 flex items-center justify-center h-16 w-full">
              <Image
                src={src}
                alt={`Logo ${i}`}
                height={48}
                width={120}
                className="object-contain h-full w-auto grayscale hover:grayscale-0 transition duration-300"
              />
            </div>
          ))}
        </Marquee>
      </section>

      {/* CTA Section */}
      <section id="cta" className="relative z-10 px-6 py-24 text-center bg-gradient-to-b from-[#0c0c0c]/80 to-[#0a0a0a]/80">
        <h2 className="text-4xl font-bold mb-6">Ready to Scale Your Agents?</h2>
        <p className="text-gray-400 text-lg mb-10">Join leading teams who are building the future of AI workflows with Agentec.</p>
        <Button size="lg" className="hover:bg-gray-300 text-lg font-bold gap-2 px-8 py-6 bg-white text-black hover:scale-105 transition-transform">
          Get Started Free <ArrowRight className="w-5 h-5" />
        </Button>
      </section>



      {/* Footer */}
      <footer className="text-gray-500 text-center text-sm py-6 border-t border-neutral-800 bg-[#0a0a0a]/90">
        © 2025 Agentec. All rights reserved.
      </footer>
    </main>
  );
}
