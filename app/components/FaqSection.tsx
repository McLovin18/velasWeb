"use client";

import React, { useState } from "react";

type FaqItem = {
  question: string;
  answers: string[];
};

const FAQ_DATA: FaqItem[] = [
  {
    question: "¿Cuáles son las formas de pago disponibles?",
    answers: [
      "Aceptamos pagos en efectivo (en local físico), por medio de transferencia y tarjeta de crédito.",
      "Todos los pagos proceden de manera segura para cuidar de tu información personal.",
    ],
  },
  {
    question: "¿Realizan envíos?",
    answers: [
      "Realizamos envíos a todo Ecuador, a provincias, por medio de Servientrega.",
      "Dentro de Guayaquil el envío se realiza con motorizado; el valor de envío se calcula según el punto en donde se ubique.",
      "El envío es gratis dentro de Guayaquil siempre y cuando sea un monto minimo de $50.",
    ],
  },
  {
    question: "Política de cambio",
    answers: [
      "La prenda puede ser cambiada dentro de un lapso de 24 horas, siempre y cuando esté en buen estado.",
      "No realizamos cambios en efectivo (solo intercambiándola con otra prenda).",
    ],
  },
];

function FaqRow({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="group relative border-b last:border-b-0"
      style={{ borderColor: "var(--border)" }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 py-6 sm:py-7 text-left focus:outline-none"
      >
        <div className="flex items-start gap-4 sm:gap-6 min-w-0">
          <span
            className="flex-shrink-0 text-xs sm:text-sm mt-1 transition-colors duration-300"
            style={{ color: isOpen ? "var(--primary)" : "var(--mutedForeground)" }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3
            className="text-base sm:text-xl md:text-2xl font-heading transition-colors duration-300"
            style={{ color: isOpen ? "var(--primary)" : "var(--text)" }}
          >
            {item.question}
          </h3>
        </div>

        {/* Botón +/- */}
        <span
          className="relative flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-full border flex items-center justify-center transition-all duration-300"
          style={{
            borderColor: isOpen ? "var(--primary)" : "var(--border)",
            background: isOpen ? "var(--primary)" : "transparent",
          }}
        >
          <span
            className="absolute w-3.5 sm:w-4 h-[2px] rounded-full transition-colors duration-300"
            style={{ background: isOpen ? "var(--primaryForeground)" : "var(--text)" }}
          />
          <span
            className="absolute w-3.5 sm:w-4 h-[2px] rounded-full transition-all duration-300"
            style={{
              background: isOpen ? "var(--primaryForeground)" : "var(--text)",
              transform: isOpen ? "rotate(0deg)" : "rotate(90deg)",
            }}
          />
        </span>
      </button>

      {/* Contenido animado con grid-template-rows trick */}
      <div
        className="grid transition-[grid-template-rows] duration-400 ease-in-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="pl-0 sm:pl-[3.25rem] pb-6 sm:pb-7 pr-10 sm:pr-16 space-y-2.5">
            {item.answers.map((line, i) => (
              <p
                key={i}
                className="text-sm sm:text-base leading-relaxed flex gap-2.5"
                style={{ color: "black" }}
              >
                <span className="flex-shrink-0 mt-0.5" style={{ color: "var(--primary)" }}>
                  ›
                </span>
                <span>{line}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FaqSection() {
  // Todos cerrados por defecto: ningún índice abierto al cargar
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section
      className="relative px-4 sm:px-6 py-16 sm:py-24 overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <div className="relative max-w-3xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-heading"
            style={{ color: "var(--text)" }}
          >
            Preguntas frecuentes
          </h2>
        </div>

        <div
          className="rounded-2xl border px-4 sm:px-8"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          {FAQ_DATA.map((item, idx) => (
            <FaqRow
              key={idx}
              item={item}
              index={idx}
              isOpen={openIndex === idx}
              onToggle={() => handleToggle(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}