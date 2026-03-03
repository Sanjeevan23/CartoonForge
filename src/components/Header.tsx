// src/components/Header.tsx
"use client";
import { useState, useEffect } from "react";

export default function Header() {
  const [theme, setTheme] = useState<"dark"|"light">("dark");
  useEffect(()=> {
    document.documentElement.setAttribute("data-theme", theme);
  },[theme]);

  return (
    <header className="w-full py-4 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold">AI</div>
        <div>
          <div className="text-white font-semibold">CartoonForge</div>
          <div className="text-xs text-[var(--muted)]">Photo → Cartoon (Family/Guy-like)</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <a className="text-sm px-3 py-2 rounded hover:bg-white/5 text-white">Docs</a>
        <button
          onClick={()=> setTheme(theme === "dark" ? "light" : "dark")}
          className="px-3 py-2 rounded bg-white/5 text-white"
        >
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </div>
    </header>
  );
}