"use client";
import { useReducedMotion } from "framer-motion";

export default function ScrollCue() {
  const reduce = useReducedMotion();
  return (
    <div className="flex justify-center mt-4" aria-hidden="true">
      <style>{`@keyframes bmCue{0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(9px);opacity:.9}}`}</style>
      <svg
        width="36" height="36" viewBox="0 0 36 36" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        className="text-accent-gold-vibrant"
        style={reduce ? undefined : { animation: "bmCue 1.6s ease-in-out infinite" }}
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}