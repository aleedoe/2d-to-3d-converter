"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import ImageUploader from "@/components/ImageUploader";
import LoadingOverlay from "@/components/LoadingOverlay";
import { Sparkles, Download, RotateCcw, Box } from "lucide-react";

const ModelViewer = dynamic(() => import("@/components/ModelViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
      <Box className="w-8 h-8 text-white/20 animate-pulse" />
    </div>
  ),
});

type AppState = "idle" | "ready" | "loading" | "done" | "error";

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [modelBlob, setModelBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleImageSelected = useCallback((file: File) => {
    setSelectedFile(file);
    setState("ready");
    setModelUrl(null);
    setModelBlob(null);
    setErrorMsg("");
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!selectedFile) return;

    setState("loading");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const res = await fetch("/api/generate-3d", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server error ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      setModelBlob(blob);
      setModelUrl(url);
      setState("done");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setErrorMsg(message);
      setState("error");
    }
  }, [selectedFile]);

  const handleDownload = useCallback(() => {
    if (!modelBlob) return;

    const url = URL.createObjectURL(modelBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "model.glb";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [modelBlob]);

  const handleReset = useCallback(() => {
    setState("idle");
    setSelectedFile(null);
    setModelUrl(null);
    setModelBlob(null);
    setErrorMsg("");
  }, []);

  const isLoading = state === "loading";

  const canGenerate = useMemo(
    () => state === "ready" || state === "error",
    [state]
  );

  return (
    <main className="min-h-screen bg-background">
      {/* ─── Header ───────────────────────────────────────────────── */}
      <header className="border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600">
              <Box className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white tracking-tight">
                2D → 3D Converter
              </h1>
              <p className="text-[11px] text-white/40 -mt-0.5">
                Powered by Hunyuan3D
              </p>
            </div>
          </div>

          {state === "done" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-white/50 hover:text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              New
            </Button>
          )}
        </div>
      </header>

      {/* ─── Content ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Left Panel: Upload ────────────────────────────────── */}
          <Card className="bg-white/[0.03] border-white/[0.08] p-6 space-y-6">
            <div>
              <h2 className="text-sm font-medium text-white/80">Input Image</h2>
              <p className="text-xs text-white/40 mt-1">
                Upload a 2D image to convert into a 3D model
              </p>
            </div>

            <Separator className="bg-white/[0.06]" />

            <ImageUploader
              onImageSelected={handleImageSelected}
              disabled={isLoading}
            />

            {/* Error message */}
            {state === "error" && errorMsg && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                <p className="text-xs text-red-400">{errorMsg}</p>
              </div>
            )}

            {/* Generate button */}
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600
                         hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium
                         shadow-lg shadow-violet-500/20 transition-all duration-300
                         disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate 3D Model
            </Button>
          </Card>

          {/* ── Right Panel: 3D Preview ──────────────────────────── */}
          <Card className="bg-white/[0.03] border-white/[0.08] p-6 space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-white/80">
                  3D Preview
                </h2>
                <p className="text-xs text-white/40 mt-1">
                  {state === "done"
                    ? "Rotate, pan & zoom to inspect"
                    : "Your generated model will appear here"}
                </p>
              </div>

              {state === "done" && (
                <Button
                  onClick={handleDownload}
                  size="sm"
                  className="bg-white/10 hover:bg-white/15 text-white border border-white/10
                             rounded-xl transition-all duration-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download .glb
                </Button>
              )}
            </div>

            <Separator className="bg-white/[0.06]" />

            {/* 3D Canvas / Placeholder */}
            {modelUrl ? (
              <ModelViewer modelUrl={modelUrl} />
            ) : (
              <div className="w-full min-h-[400px] rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center justify-center gap-3">
                <Box className="w-10 h-10 text-white/10" />
                <p className="text-xs text-white/20">No model yet</p>
              </div>
            )}

            {/* Loading overlay */}
            <LoadingOverlay isVisible={isLoading} />
          </Card>
        </div>
      </div>
    </main>
  );
}
