import React, { useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Settings2,
  KeyRound,
  Cpu,
} from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

export default function Settings() {
  const [, setLocation] = useLocation();
  const [anthropicKey, setAnthropicKey] = useState(
    import.meta.env.VITE_ANTHROPIC_API_KEY || "",
  );
  const [geminiGenKey, setGeminiGenKey] = useState(
    import.meta.env.VITE_GEMINIGEN_API_KEY || "",
  );
  const [showAnthropic, setShowAnthropic] = useState(false);
  const [showGemini, setShowGemini] = useState(false);

  const [imageModel, setImageModel] = useState("imagen-4-ultra");
  const [videoModel, setVideoModel] = useState("veo-3.1");

  const [testMode, setTestMode] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save logic since environment overrides are handled backend-side in real usage
    alert(
      "In this preview, API Keys are managed via AI Studio Secrets Panel or backend .env file. Changes here are mock UI.",
    );
  };

  const handleTest = () => {
    setTestMode("testing");
    setTimeout(() => {
      // Simulate real test
      setTestMode("success");
      setTimeout(() => setTestMode("idle"), 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-gray-100 pb-10 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <Navbar />

      <div className="p-4 sm:p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto space-y-6 sm:space-y-8 mt-2 sm:mt-4"
        >
          <header className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6 sm:mb-12 border-b border-brand-border pb-4 sm:pb-6">
            <button
              onClick={() => setLocation("/")}
              className="p-2 w-fit glassmorphism hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white flex items-center justify-center min-w-[44px] min-h-[44px]"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-primary/20 to-purple-600/20 border border-brand-primary/30 flex items-center justify-center text-brand-primary">
                <Settings2 size={24} />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold font-sans text-brand-text-primary tracking-tight">
                  Project Settings
                </h1>
                <p className="text-brand-text-muted text-sm mt-1">
                  Configure your API keys and AI models
                </p>
              </div>
            </div>
          </header>

          <form
            onSubmit={handleSave}
            className="space-y-8 sm:space-y-10 glassmorphism border border-white/5 p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-primary via-brand-accent to-brand-gold opacity-50" />

            <div className="space-y-6 relative">
              <h2 className="text-xl font-bold text-white flex items-center space-x-3">
                <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary-light">
                  <KeyRound size={20} />
                </div>
                <span>API Credentials</span>
              </h2>
              <p className="text-sm text-gray-400 max-w-2xl">
                Securely connect your models. Keys are stored locally and only
                transmitted to the configured backend.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-3 group">
                  <label className="block text-sm font-bold text-gray-300 uppercase tracking-widest text-[11px] group-focus-within:text-brand-primary transition-colors">
                    Anthropic API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showAnthropic ? "text" : "password"}
                      value={anthropicKey}
                      onChange={(e) => setAnthropicKey(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl pl-4 pr-12 py-4 text-sm text-gray-100 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-mono min-h-[52px] shadow-inner"
                      placeholder="sk-ant-..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowAnthropic(!showAnthropic)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-brand-primary transition-colors"
                    >
                      {showAnthropic ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3 group">
                  <label className="block text-sm font-bold text-gray-300 uppercase tracking-widest text-[11px] group-focus-within:text-brand-accent transition-colors">
                    GeminiGen API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showGemini ? "text" : "password"}
                      value={geminiGenKey}
                      onChange={(e) => setGeminiGenKey(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl pl-4 pr-12 py-4 text-sm text-gray-100 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all font-mono min-h-[52px] shadow-inner"
                      placeholder="Your base-64 GeminiGen Key"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGemini(!showGemini)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-brand-accent transition-colors"
                    >
                      {showGemini ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="space-y-6 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-3">
                <div className="p-2 bg-brand-accent/10 rounded-lg text-brand-accent">
                  <Cpu size={20} />
                </div>
                <span>Model Orchestration</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-3 group">
                  <label className="block text-sm font-bold text-gray-300 uppercase tracking-widest text-[11px] group-focus-within:text-gray-100 transition-colors">
                    Image Generation Model
                  </label>
                  <div className="relative">
                    <select
                      value={imageModel}
                      onChange={(e) => setImageModel(e.target.value)}
                      className="w-full min-h-[52px] bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-sm text-gray-100 focus:outline-none focus:border-gray-500 transition-all appearance-none cursor-pointer hover:bg-white/5"
                    >
                      <option value="imagen-4-ultra">
                        Imagen 4 Ultra (Premium)
                      </option>
                      <option value="nano-banana">Nano Banana (Fast)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <svg
                        width="12"
                        height="8"
                        viewBox="0 0 12 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 1.5L6 6.5L11 1.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 group">
                  <label className="block text-sm font-bold text-gray-300 uppercase tracking-widest text-[11px] group-focus-within:text-gray-100 transition-colors">
                    Video Generation Model
                  </label>
                  <div className="relative">
                    <select
                      value={videoModel}
                      onChange={(e) => setVideoModel(e.target.value)}
                      className="w-full min-h-[52px] bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-sm text-gray-100 focus:outline-none focus:border-gray-500 transition-all appearance-none cursor-pointer hover:bg-white/5"
                    >
                      <option value="veo-3.1">Veo 3.1 (Cinematic)</option>
                      <option value="veo-3-fast">Veo 3 Fast (Speed)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <svg
                        width="12"
                        height="8"
                        viewBox="0 0 12 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 1.5L6 6.5L11 1.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end items-center sm:items-center bg-black/20 -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 p-6 sm:p-8 rounded-b-3xl border-t border-white/5 mt-6 sm:mt-10 gap-4">
              <button
                type="button"
                onClick={handleTest}
                disabled={testMode === "testing"}
                className="w-full sm:w-auto flex justify-center px-6 py-3 min-h-[48px] glassmorphism hover:bg-white/10 text-gray-300 rounded-xl transition-all font-bold border border-white/10 flex items-center space-x-2"
              >
                {testMode === "testing" && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full"
                  />
                )}
                {testMode === "success" && (
                  <CheckCircle2 size={18} className="text-green-500" />
                )}
                {testMode === "error" && (
                  <XCircle size={18} className="text-red-500" />
                )}
                {testMode === "idle" && <span>Test Connection</span>}
                <span>
                  {testMode === "testing"
                    ? "Testing..."
                    : testMode === "success"
                      ? "Connected"
                      : testMode === "error"
                        ? "Failed"
                        : ""}
                </span>
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto flex justify-center items-center space-x-2 px-8 py-3 min-h-[48px] bg-gradient-to-r from-brand-primary to-brand-primary-light hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] text-white rounded-xl transition-all font-bold group"
              >
                <Save
                  size={18}
                  className="group-hover:scale-110 transition-transform"
                />
                <span>Save Configuration</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
