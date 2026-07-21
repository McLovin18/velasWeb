"use client";

import React, { useState } from "react";

/**
 * Botón flotante tipo "timbre".
 * - Círculo principal con animación de salto suave (llama la atención).
 * - Al hacer click despliega hacia arriba los íconos de contacto (Ubicación, Instagram, WhatsApp).
 * - Al volver a hacer click, se ocultan.
 * - Al hacer hover/click sobre WhatsApp, se despliegan a un lado 2 contactos (Asesora 1 y Asesora 2).
 * - Colores tomados de la paleta del proyecto (mahogany, tobacco, mountain, sand, vanilla).
 */

const WHATSAPP_URL_1 = "https://wa.me/593988705890"; // 👉 Asesora 1
const WHATSAPP_URL_2 = "https://wa.me/593000000000"; // 👉 Asesora 2 — reemplaza por el número real
const INSTAGRAM_URL = "https://www.instagram.com/juliana.basics/";
const MAPS_URL = "https://l.instagram.com/?u=https%3A%2F%2Fmaps.app.goo.gl%2FB4LVAYLxvMuwXsuE9%3Fg_st%3Dic%26utm_source%3Dig%26utm_medium%3Dsocial%26utm_content%3Dlink_in_bio%26fbclid%3DPAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQPOTM2NjE5NzQzMzkyNDU5AAGn_oqrYzsBMtPRc2N2aptDbGXg-iG5-VFhRCD6m4VnleH_jHY5zLezUdJza74_aem_B3z_UlltnRGnSSLfWrFf4w&e=AUD8pWkXfdA34eOteUrOjVR1HPRDj6F7-to54sCO4vLiuhm1_Mlp2-GkL3MlI46kCH00PHVdOMrM-W9V32NSvMywrrydKa5uKx-XFxb_vRVGZuWMIZrLC9G1j6ofwMn3GLJ2er0"; // 👉 reemplaza por el enlace real de Google Maps

const FloatingContactButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(false);

  const closeAll = () => {
    setIsOpen(false);
    setIsWhatsappOpen(false);
  };

  return (
    <>
      <style>{`
        .fab-container {
          position: fixed;
          bottom: 5.25rem;
          right: 1.25rem;
          z-index: 50;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        @media (min-width: 768px) {
          .fab-container {
            bottom: 1.75rem;
            right: 1.75rem;
          }
        }

        /* --- Íconos secundarios (ubicación / instagram / whatsapp) --- */
        .fab-item {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(88, 71, 56, 0.28);
          opacity: 0;
          transform: translateY(12px) scale(0.85);
          pointer-events: none;
          transition: opacity 0.25s ease, transform 0.25s ease, box-shadow 0.22s ease;
        }

        @media (min-width: 768px) {
          .fab-item {
            width: 52px;
            height: 52px;
          }
        }

        .fab-item svg {
          width: 24px;
          height: 24px;
          fill: var(--color-vanilla, #f1eada);
        }

        .fab-item:hover {
          transform: translateY(0) scale(1.08) !important;
          box-shadow: 0 6px 20px rgba(88, 71, 56, 0.38);
        }

        .fab-item.open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        .fab-item.location {
          background: var(--color-sand, #cec1a8);
          transition-delay: 0.12s;
        }

        .fab-item.instagram {
          background: var(--color-mountain, #aaa396);
          transition-delay: 0.06s;
        }

        .fab-item.whatsapp {
          background: var(--color-tobacco, #b59e7d);
          transition-delay: 0s;
          position: relative;
          z-index: 2;
        }

        /* --- Wrapper de WhatsApp (contiene el botón + submenú lateral) --- */
        .fab-whatsapp-wrap {
          position: relative;
        }

        /* --- Submenú lateral de WhatsApp (2 asesoras, apiladas verticalmente) --- */
        .fab-whatsapp-sub {
          position: absolute;
          right: calc(100% + 12px);
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          z-index: 1;
        }

        .fab-sub-item {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          background: var(--color-tobacco, #b59e7d);
          box-shadow: 0 4px 14px rgba(88, 71, 56, 0.28);
          opacity: 0;
          transform: translateX(10px) scale(0.8);
          pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.22s ease;
          position: relative;
        }

        @media (min-width: 768px) {
          .fab-sub-item {
            width: 46px;
            height: 46px;
          }
        }

        .fab-sub-item svg {
          width: 21px;
          height: 21px;
          fill: var(--color-vanilla, #f1eada);
        }

        .fab-sub-item:hover {
          transform: translateX(0) scale(1.08) !important;
          box-shadow: 0 6px 20px rgba(88, 71, 56, 0.38);
        }

        .fab-sub-item.open {
          opacity: 1;
          transform: translateX(0) scale(1);
          pointer-events: auto;
        }

        .fab-sub-item:nth-child(1) {
          transition-delay: 0s;
        }

        .fab-sub-item:nth-child(2) {
          transition-delay: 0.05s;
        }

        /* Etiqueta con el nombre de la asesora */
        .fab-sub-label {
          position: absolute;
          right: calc(100% + 10px);
          top: 50%;
          transform: translateY(-50%);
          background: var(--color-mahogany, #584738);
          color: var(--color-vanilla, #f1eada);
          font-family: var(--font-body-family);
          font-size: 11.5px;
          font-style: var(--font-body-style);
          font-weight: var(--font-body-weight);
          padding: 5px 10px;
          border-radius: 7px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.18s ease;
        }

        .fab-sub-item:hover .fab-sub-label {
          opacity: 1;
        }

        /* --- Botón principal (timbre) --- */
        .fab-main-wrap {
          position: relative;
          display: inline-flex;
        }

        .fab-tooltip {
          position: absolute;
          right: calc(100% + 12px);
          top: 50%;
          transform: translateY(-50%) translateX(-4px);
          background: var(--color-mahogany, #584738);
          color: var(--color-vanilla, #f1eada);
          font-family: var(--font-body-family);
          font-size: 12.5px;
          font-style: var(--font-body-style);
          font-weight: var(--font-body-weight);
          padding: 6px 12px;
          border-radius: 8px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.18s ease, transform 0.18s ease;
        }

        .fab-tooltip::before {
          content: '';
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 5px solid transparent;
          border-left-color: var(--color-mahogany, #584738);
        }

        .fab-main-wrap:hover .fab-tooltip {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }

        .fab-main {
          position: relative;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          background: var(--color-mahogany, #584738);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(88, 71, 56, 0.4);
          transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.22s ease, background 0.22s ease;
          animation: fab-bounce 2.2s ease-in-out infinite;
        }

        @media (min-width: 768px) {
          .fab-main {
            width: 60px;
            height: 60px;
          }
        }

        .fab-main.open {
          animation: none;
          background: var(--color-tobacco-dark, #9c8567);
        }

        .fab-main:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 22px rgba(88, 71, 56, 0.48);
        }

        .fab-main:active {
          transform: scale(0.94);
        }

        .fab-main svg {
          width: 26px;
          height: 26px;
          fill: var(--color-vanilla, #f1eada);
          flex-shrink: 0;
          transition: transform 0.25s ease, opacity 0.2s ease;
        }

        @media (min-width: 768px) {
          .fab-main svg {
            width: 28px;
            height: 28px;
          }
        }

        .fab-icon-bell {
          opacity: 1;
          transform: rotate(0deg) scale(1);
        }

        .fab-icon-bell.hidden {
          opacity: 0;
          transform: rotate(45deg) scale(0.5);
          position: absolute;
        }

        .fab-icon-close {
          opacity: 0;
          transform: rotate(-45deg) scale(0.5);
          position: absolute;
        }

        .fab-icon-close.visible {
          opacity: 1;
          transform: rotate(0deg) scale(1);
          position: relative;
        }

        @keyframes fab-bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-7px);
          }
        }
      `}</style>

      <div className="fab-container">
        {/* Ubicación (aparece primero, arriba de todo, cuando está abierto) */}
        <a
          href={MAPS_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Ubicación"
          className={`fab-item location ${isOpen ? "open" : ""}`}
          tabIndex={isOpen ? 0 : -1}
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 2c-4.42 0-8 3.58-8 8 0 5.5 8 12 8 12s8-6.5 8-12c0-4.42-3.58-8-8-8zm0 10.8a2.8 2.8 0 1 1 0-5.6 2.8 2.8 0 0 1 0 5.6z" />
          </svg>
        </a>

        {/* Instagram */}
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
          className={`fab-item instagram ${isOpen ? "open" : ""}`}
          tabIndex={isOpen ? 0 : -1}
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.22.6 1.77 1.15.55.55.9 1.11 1.15 1.77.25.64.42 1.37.47 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.15 1.77 4.9 4.9 0 0 1-1.77 1.15c-.64.25-1.37.42-2.43.47-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.22 1.15-1.77a4.9 4.9 0 0 1 1.77-1.15c.64-.25 1.37-.42 2.43-.47C8.94 2.01 9.28 2 12 2zm0 1.8c-2.67 0-2.99.01-4.04.06-.87.04-1.34.18-1.65.3-.42.16-.72.35-1.03.66-.31.31-.5.61-.66 1.03-.12.31-.26.78-.3 1.65C4.27 8.55 4.26 8.87 4.26 12s.01 3.45.06 4.5c.04.87.18 1.34.3 1.65.16.42.35.72.66 1.03.31.31.61.5 1.03.66.31.12.78.26 1.65.3 1.05.05 1.37.06 4.04.06s2.99-.01 4.04-.06c.87-.04 1.34-.18 1.65-.3.42-.16.72-.35 1.03-.66.31-.31.5-.61.66-1.03.12-.31.26-.78.3-1.65.05-1.05.06-1.37.06-4.5s-.01-3.45-.06-4.5c-.04-.87-.18-1.34-.3-1.65a2.77 2.77 0 0 0-.66-1.03 2.77 2.77 0 0 0-1.03-.66c-.31-.12-.78-.26-1.65-.3C14.99 3.81 14.67 3.8 12 3.8zm0 3.05a5.15 5.15 0 1 1 0 10.3 5.15 5.15 0 0 1 0-10.3zm0 1.8a3.35 3.35 0 1 0 0 6.7 3.35 3.35 0 0 0 0-6.7zm5.35-1.99a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
          </svg>
        </a>

        {/* WhatsApp + submenú de 2 asesoras */}
        <div
          className="fab-whatsapp-wrap"
          onMouseEnter={() => isOpen && setIsWhatsappOpen(true)}
          onMouseLeave={() => setIsWhatsappOpen(false)}
        >
          {/* Submenú lateral: Asesora 1 y Asesora 2, apiladas verticalmente */}
          <div className="fab-whatsapp-sub">
            <a
              href={WHATSAPP_URL_1}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp Asesora 1"
              className={`fab-sub-item ${isOpen && isWhatsappOpen ? "open" : ""}`}
              tabIndex={isOpen && isWhatsappOpen ? 0 : -1}
            >
              <span className="fab-sub-label">Asesora 1</span>
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.33.244-.73.244-1.088 0-.058 0-.144-.03-.215-.1-.172-2.434-1.39-2.678-1.39zm-2.908 7.593c-1.747 0-3.48-.53-4.942-1.49L7.793 24.41l1.132-3.337a8.955 8.955 0 0 1-1.72-5.272c0-4.955 4.04-8.995 8.997-8.995S25.2 10.845 25.2 15.8c0 4.958-4.04 8.998-8.998 8.998zm0-19.798c-5.96 0-10.8 4.842-10.8 10.8 0 1.964.53 3.898 1.546 5.574L5 27.176l5.974-1.92a10.807 10.807 0 0 0 16.03-9.455c0-5.958-4.842-10.8-10.802-10.8z" />
              </svg>
            </a>

            <a
              href={WHATSAPP_URL_2}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp Asesora 2"
              className={`fab-sub-item ${isOpen && isWhatsappOpen ? "open" : ""}`}
              tabIndex={isOpen && isWhatsappOpen ? 0 : -1}
            >
              <span className="fab-sub-label">Asesora 2</span>
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.33.244-.73.244-1.088 0-.058 0-.144-.03-.215-.1-.172-2.434-1.39-2.678-1.39zm-2.908 7.593c-1.747 0-3.48-.53-4.942-1.49L7.793 24.41l1.132-3.337a8.955 8.955 0 0 1-1.72-5.272c0-4.955 4.04-8.995 8.997-8.995S25.2 10.845 25.2 15.8c0 4.958-4.04 8.998-8.998 8.998zm0-19.798c-5.96 0-10.8 4.842-10.8 10.8 0 1.964.53 3.898 1.546 5.574L5 27.176l5.974-1.92a10.807 10.807 0 0 0 16.03-9.455c0-5.958-4.842-10.8-10.802-10.8z" />
              </svg>
            </a>
          </div>

          {/* Botón principal de WhatsApp */}
          <button
            type="button"
            aria-label="Contactar por WhatsApp"
            aria-expanded={isOpen && isWhatsappOpen}
            className={`fab-item whatsapp ${isOpen ? "open" : ""}`}
            tabIndex={isOpen ? 0 : -1}
            onClick={(e) => {
              e.stopPropagation();
              if (isOpen) setIsWhatsappOpen((prev) => !prev);
            }}
          >
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.33.244-.73.244-1.088 0-.058 0-.144-.03-.215-.1-.172-2.434-1.39-2.678-1.39zm-2.908 7.593c-1.747 0-3.48-.53-4.942-1.49L7.793 24.41l1.132-3.337a8.955 8.955 0 0 1-1.72-5.272c0-4.955 4.04-8.995 8.997-8.995S25.2 10.845 25.2 15.8c0 4.958-4.04 8.998-8.998 8.998zm0-19.798c-5.96 0-10.8 4.842-10.8 10.8 0 1.964.53 3.898 1.546 5.574L5 27.176l5.974-1.92a10.807 10.807 0 0 0 16.03-9.455c0-5.958-4.842-10.8-10.802-10.8z" />
            </svg>
          </button>
        </div>

        {/* Botón principal (timbre) */}
        <div className="fab-main-wrap">
          <span className="fab-tooltip">
            {isOpen ? "Cerrar" : "Contáctanos"}
          </span>

          <button
            type="button"
            aria-label={isOpen ? "Cerrar menú de contacto" : "Abrir menú de contacto"}
            aria-expanded={isOpen}
            className={`fab-main ${isOpen ? "open" : ""}`}
            onClick={() => {
              if (isOpen) {
                closeAll();
              } else {
                setIsOpen(true);
              }
            }}
          >
            {/* Ícono de burbuja de chat (contáctanos) */}
            <svg
              className={`fab-icon-bell ${isOpen ? "hidden" : ""}`}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M12 2C6.48 2 2 5.94 2 10.8c0 2.42 1.12 4.6 2.94 6.17-.1 1.14-.5 2.53-1.28 3.85a.5.5 0 0 0 .58.73c1.87-.5 3.6-1.34 4.7-1.99a11.6 11.6 0 0 0 3.06.4c5.52 0 10-3.94 10-8.8S17.52 2 12 2zm-4.6 9.8a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4zm4.6 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4zm4.6 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4z" />
            </svg>

            {/* Ícono de cerrar (X) */}
            <svg
              className={`fab-icon-close ${isOpen ? "visible" : ""}`}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M18.3 5.71 12 12.01l-6.3-6.3-1.41 1.41 6.3 6.3-6.3 6.29 1.41 1.41 6.3-6.29 6.3 6.29 1.41-1.41-6.3-6.29 6.3-6.3z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default FloatingContactButton;
