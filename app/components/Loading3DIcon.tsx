"use client";
 
import React from "react";
 
export function Loading3DIcon() {
  return (
    <div className="flex flex-col items-center justify-center py-10 select-none">
 
      {/* CONTENEDOR */}
      <div className="relative w-36 h-36 flex items-center justify-center">
 
        {/* Glow principal */}
        <div className="
          absolute inset-0
          bg-[var(--primary)]/15
          blur-3xl
          rounded-full
          animate-pulse
        " />
 
        {/* Ring exterior */}
        <div className="
          absolute inset-2
          rounded-full
          border border-[var(--border)]
        " />
 
        {/* Ring animado */}
        <div className="
          absolute inset-0
          rounded-full
          border-2 border-transparent
          border-t-[var(--primary)]
          animate-spin
        "
        style={{
          animationDuration: "2.5s"
        }}
        />
 
        {/* Núcleo */}
        <div className="
          relative w-24 h-24
          rounded-full
          bg-[var(--primary)]
          shadow-[0_0_40px_rgba(88,71,56,0.35)]
          flex items-center justify-center
        ">
 
          {/* Ícono: percha (hanger) */}
          <div className="relative w-12 h-12 animate-pulse flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-[0_0_10px_rgba(241,234,218,0.5)]"
              fill="none"
              stroke="var(--color-vanilla, #f1eada)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* gancho */}
              <path d="M12 3.5v2" />
              <circle cx="12" cy="4.5" r="1" fill="var(--color-vanilla, #f1eada)" stroke="none" />
              {/* percha */}
              <path d="M12 6.5c-1 0-1.8.7-1.8 1.6 0 .8.6 1.4 1.3 1.5L3.5 15.4c-.7.5-.4 1.6.5 1.6h16c.9 0 1.2-1.1.5-1.6L12.5 9.6c.7-.1 1.3-.7 1.3-1.5 0-.9-.8-1.6-1.8-1.6z" />
              {/* barra inferior */}
              <path d="M5.5 15.9h13" />
            </svg>
          </div>
        </div>
      </div>
 
      {/* Texto */}
      <div className="mt-6 flex flex-col items-center">
 
        <span className="
          text-[11px]
          font-bold
          tracking-[0.35em]
          uppercase
          text-[var(--text)]
        ">
          Juliana Basics
        </span>
 
 
        <div className="flex gap-1.5 mt-3 items-center">
 
          <div className="flex gap-1.5 animate-loadingSteps">
 
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
 
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
 
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
 
          </div>
        </div>
      </div>
    </div>
  );
}