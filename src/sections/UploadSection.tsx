// src/sections/UploadSection.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";

type Mode = "cartoongan" | "faststyle" | "opencv_cartoon" | "cel_cartoon" | "sketch" | "stylize";
type Preset = "default" | "family_guy" | "ben10" | "avengers";

function NiceLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <label className={`block text-xs text-gray-300 mb-1 ${className}`}>{children}</label>;
}

function IconDownload() {
  return (
    <svg className="w-4 h-4 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 10l5 5 5-5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 15V3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SkeletonImage({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 ${className}`} />;
}

// small helper to format seconds
function formatSec(s?: string | null) {
  if (!s) return null;
  try {
    const n = parseFloat(s);
    return `${n.toFixed(2)}s`;
  } catch {
    return s;
  }
}

export default function UploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [procTime, setProcTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>("cartoongan");
  const [preset, setPreset] = useState<Preset>("default");
  const [strength, setStrength] = useState<number>(0.92);
  const [posterize, setPosterize] = useState<number>(4);
  const [paletteColors, setPaletteColors] = useState<number>(8);
  const [edgeThickness, setEdgeThickness] = useState<number>(1);
  const [sr, setSr] = useState<boolean>(false);

  const progressRef = useRef<number>(0);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // small progress sim to show nice animated progress bar
  useEffect(() => {
    let t: number | undefined;
    if (loading) {
      progressRef.current = 6;
      setProgress(6);
      t = window.setInterval(() => {
        // gently increase progress until 90% (finalization uses real time)
        progressRef.current = Math.min(90, progressRef.current + Math.random() * 8);
        setProgress(Math.floor(progressRef.current));
      }, 350);
    } else {
      // complete progress
      progressRef.current = 100;
      setProgress(100);
      const timeout = setTimeout(() => {
        setProgress(0);
      }, 600);
      return () => clearTimeout(timeout);
    }
    return () => {
      if (t) clearInterval(t);
    };
  }, [loading]);

  const onDropFile = (f?: File) => {
    if (!f) return;
    setFile(f);
    setResultUrl(null);
    setError(null);
    setProcTime(null);
  };

  const stylize = async () => {
    if (!file) {
      setError("Choose an image first");
      return;
    }
    setError(null);
    setLoading(true);
    setResultUrl(null);
    setProcTime(null);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("mode", mode);
      form.append("preset", preset);
      form.append("strength", String(strength));
      form.append("posterize_levels", String(posterize));
      form.append("palette_colors", String(paletteColors));
      form.append("edge_thickness", String(edgeThickness));
      form.append("sr", String(sr));

      const res = await fetch("http://127.0.0.1:8000/stylize", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server ${res.status}: ${text}`);
      }

      // read the blob response
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);

      const ptime = res.headers.get("X-Processing-Time");
      const fallback = res.headers.get("X-Used-Fallback");
      setProcTime((ptime ? `${formatSec(ptime)}` : null) + (fallback === "True" || fallback === "true" ? " (fallback used)" : ""));
    } catch (err: any) {
      setError(err?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPreview(null);
    setResultUrl(null);
    setError(null);
    setProcTime(null);
    setProgress(0);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="py-10 px-4 max-w-5xl mx-auto"
    >
      <div className="bg-gradient-to-br from-black/60 to-slate-900/50 p-5 rounded-2xl border border-gray-800">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 text-white">
            <h2 className="text-2xl font-semibold">Stylize / Cartoonize</h2>
            <p className="text-sm text-gray-400 mt-1">
              Produce crisp, cel-shaded cartoons — not paintings. Choose presets inspired by styles like "family guy", "ben 10", or "avengers".
              Neural models used if available; robust OpenCV pipeline otherwise.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <NiceLabel>Upload or drop</NiceLabel>
                <div
                  className="border border-dashed border-gray-700 rounded-md p-3 cursor-pointer hover:border-gray-600"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e: any) => onDropFile(e.target.files?.[0]);
                    input.click();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">AI</div>
                    <div>
                      <div className="text-sm">{file ? file.name : "Click to choose or drop an image"}</div>
                      <div className="text-xs text-gray-500 mt-1">PNG/JPG, recommended <strong>512–2048px</strong></div>
                    </div>
                    <div className="ml-auto text-xs text-gray-400">Max 10MB</div>
                  </div>
                </div>
              </div>

              <div>
                <NiceLabel>Mode</NiceLabel>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as Mode)}
                  className="w-full px-3 py-2 rounded bg-gray-800 text-white"
                >
                  <option value="cartoongan">Neural Cartoon (best)</option>
                  <option value="cel_cartoon">Cel Cartoon (fast, adjustable)</option>
                  <option value="faststyle">Fast Style (neural)</option>
                  <option value="opencv_cartoon">OpenCV Cartoon (fast)</option>
                  <option value="stylize">Stylize (artistic)</option>
                  <option value="sketch">Pencil Sketch</option>
                </select>

                <NiceLabel className="mt-3">Preset</NiceLabel>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => setPreset("default")}
                    className={`text-xs px-3 py-1 rounded ${preset === "default" ? "bg-emerald-500 text-black" : "border border-gray-700 text-gray-300"}`}
                  >
                    Default
                  </button>
                  <button
                    onClick={() => setPreset("family_guy")}
                    className={`text-xs px-3 py-1 rounded ${preset === "family_guy" ? "bg-indigo-500 text-black" : "border border-gray-700 text-gray-300"}`}
                  >
                    Family Guy
                  </button>
                  <button
                    onClick={() => setPreset("ben10")}
                    className={`text-xs px-3 py-1 rounded ${preset === "ben10" ? "bg-yellow-400 text-black" : "border border-gray-700 text-gray-300"}`}
                  >
                    Ben 10
                  </button>
                  <button
                    onClick={() => setPreset("avengers")}
                    className={`text-xs px-3 py-1 rounded ${preset === "avengers" ? "bg-red-500 text-black" : "border border-gray-700 text-gray-300"}`}
                  >
                    Avenger
                  </button>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <NiceLabel>Strength (blend)</NiceLabel>
                <input
                  type="range"
                  min={0.0}
                  max={1.0}
                  step={0.01}
                  value={strength}
                  onChange={(e) => setStrength(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-400">{(strength * 100).toFixed(0)}%</div>
              </div>

              <div>
                <NiceLabel>Posterize levels</NiceLabel>
                <input
                  type="range"
                  min={1}
                  max={8}
                  step={1}
                  value={posterize}
                  onChange={(e) => setPosterize(parseInt(e.target.value, 10))}
                  className="w-full"
                />
                <div className="text-xs text-gray-400">{posterize} bits</div>
              </div>

              <div>
                <NiceLabel>Palette colors (quantization)</NiceLabel>
                <input
                  type="range"
                  min={2}
                  max={24}
                  step={1}
                  value={paletteColors}
                  onChange={(e) => setPaletteColors(parseInt(e.target.value, 10))}
                  className="w-full"
                />
                <div className="text-xs text-gray-400">{paletteColors} colors</div>
              </div>

              <div>
                <NiceLabel>Outline thickness</NiceLabel>
                <input
                  type="range"
                  min={0}
                  max={6}
                  step={1}
                  value={edgeThickness}
                  onChange={(e) => setEdgeThickness(parseInt(e.target.value, 10))}
                  className="w-full"
                />
                <div className="text-xs text-gray-400">{edgeThickness}px</div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={stylize}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-emerald-400 text-black font-semibold shadow hover:scale-[1.02] transition transform"
              >
                {loading ? "Processing..." : "Stylize"}
              </button>

              <button
                onClick={() => {
                  resetAll();
                }}
                className="px-3 py-2 rounded-lg border border-gray-700 text-white"
              >
                Reset
              </button>

              <div className="ml-auto flex items-center gap-4 text-xs">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={sr} onChange={(e) => setSr(e.target.checked)} />
                  <span className="text-gray-300">Super-res (if available)</span>
                </label>

                <div className="text-gray-400">{procTime ? `Processed in ${procTime}` : <>&nbsp;</>}</div>
              </div>
            </div>

            {error && <div className="mt-3 text-sm text-rose-400">{error}</div>}
          </div>

          {/* Right column: small preview and help */}
          <div className="w-full md:w-56 flex-shrink-0">
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
              <div className="w-full h-40 rounded overflow-hidden flex items-center justify-center bg-gray-800">
                {preview ? (
                  <img src={preview} alt="preview" className="object-cover w-full h-full" />
                ) : (
                  <div className="text-gray-500 text-sm text-center px-2">No image selected</div>
                )}
              </div>

              <div className="mt-3 text-xs text-gray-400">
                Tips:
                <ul className="list-disc ml-4 mt-2 space-y-1">
                  <li>Faces work best when centered and well-lit.</li>
                  <li>Use <strong>cel_cartoon</strong> or presets for crisp cartoon style.</li>
                  <li>Use SR for low-res images (if enabled server-side).</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Results area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Original */}
          <div className="bg-white/3 p-4 rounded-2xl min-h-[260px] flex flex-col">
            <h3 className="text-white mb-2">Original</h3>
            <div className="flex-1 flex items-center justify-center">
              {preview ? (
                <img src={preview} className="max-h-96 object-contain rounded" />
              ) : (
                <SkeletonImage className="w-full h-56 rounded" />
              )}
            </div>
          </div>

          {/* Result */}
          <div className="bg-white/3 p-4 rounded-2xl min-h-[260px] flex flex-col">
            <h3 className="text-white mb-2">Result</h3>

            <div className="flex-1 flex items-center justify-center flex-col">
              {loading && (
                <div className="w-full max-w-xl p-4">
                  {/* Progress bar */}
                  <div className="w-full h-3 bg-gray-700 rounded overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-indigo-500 transition-all"
                      style={{ width: `${progress}%`, transition: "width 300ms linear" }}
                    />
                  </div>

                  <div className="mt-4 w-full flex gap-3">
                    <div className="flex-1">
                      <SkeletonImage className="w-full h-40 rounded" />
                    </div>
                    <div className="w-36 space-y-2">
                      <SkeletonImage className="w-full h-12 rounded" />
                      <SkeletonImage className="w-full h-12 rounded" />
                    </div>
                  </div>
                </div>
              )}

              {!loading && resultUrl && preview && (
                <div className="w-full">
                  <div className="mb-3">
                    <ReactCompareSlider
                      itemOne={<ReactCompareSliderImage src={preview} alt="original" />}
                      itemTwo={<ReactCompareSliderImage src={resultUrl} alt="stylized" />}
                    />
                  </div>

                  <div className="flex gap-3 justify-center">
                    <a href={resultUrl} download="stylized.png" className="px-4 py-2 rounded-lg bg-emerald-500 text-black inline-flex items-center">
                      <IconDownload /> Download PNG
                    </a>
                    <a href={resultUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg border border-gray-700 text-white">
                      Open
                    </a>
                  </div>
                </div>
              )}

              {!loading && !resultUrl && (
                <div className="text-gray-400">No result yet. Upload and press Stylize.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}