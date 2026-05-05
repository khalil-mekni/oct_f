"use client";

import React from "react";

type Props = {
  onClick: () => void;
  label?: React.ReactNode; // ✅ corrigé ici
  className?: string;
};

export default function OcrUploadButton({
  onClick,
  label = "Upload",
  className = "bg-white text-gray-900 border-2 border-gray-900 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all shadow-[8px_8px_0px_rgba(0,160,157,0.2)]",
}: Props) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`rounded-xl border px-4 py-2 font-medium ${className}`}
    >
      {label}
    </button>
  );
}