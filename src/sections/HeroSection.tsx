// src/sections/HeroSection.tsx
"use client";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="py-16 px-6 text-center"
    >
      <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
        Cartoonizer — Turn photos into real cartoons
      </h1>
      <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
        Convert your photos into crisp flat-color cartoons with bold outlines — fast on CPU, neural models optional.
      </p>
    </motion.header>
  );
}