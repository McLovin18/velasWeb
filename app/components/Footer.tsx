"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useTracking } from "../lib/useAnalytics";
import WhatsAppFloatingButton from "./WhatsAppFloatingButton";
import styles from "./Footer.module.css";

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M22 12.061C22 6.505 17.523 2 12 2S2 6.505 2 12.061c0 5.022 3.657 9.184 8.438 9.939v-7.03H7.898v-2.909h2.54V9.845c0-2.53 1.492-3.93 3.777-3.93 1.094 0 2.238.197 2.238.197v2.475h-1.26c-1.243 0-1.63.775-1.63 1.57v1.884h2.773l-.443 2.909h-2.33V22c4.78-.755 8.438-4.917 8.438-9.939z" />
  </svg>
);

const socialLinks = [
  { href: "https://www.instagram.com/juliana.basics/", label: "Instagram", Icon: IconInstagram },
];

const Footer: React.FC = () => {
  const pathname = usePathname();
  const { trackLinkClick } = useTracking();

  const showWhatsAppFloating = pathname && !pathname.startsWith("/admin");

  return (
    <>
      <footer className={styles.pdxFooter}>
        <div className={styles.ftGlowLeft} />
        <div className={styles.ftGlowRight} />

        {/* Main row */}
        <div className={styles.ftMain}>
          <div className="flex flex-col gap-8 items-center">

            {/* Redes sociales */}
            <div className="w-full flex justify-center">
              <ul className={styles.ftSocials}>
                {socialLinks.map(({ href, label, Icon }) => (
                  <li key={label}>
                    <a href={href} className={styles.ftSocialsLink} target="_blank" rel="noreferrer" title={label} onClick={() => trackLinkClick().catch(console.error)}>
                      <Icon />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.ftDivider} />

        {/* Copyright row */}
        <div className={styles.ftCopyRow}>
          <p className={styles.ftCopyText}>
            © {new Date().getFullYear()} Juliana Basics 2026. Todos los derechos reservados.
          </p>
          <div className={styles.ftCopyRight}>
            <div className={styles.ftBadge}>
              <div className={styles.ftBadgeDot} />
              Hecho en Ecuador
            </div>
            <a
              href="https://www.instagram.com/hector.cobena/"
              target="_blank"
              rel="noreferrer"
              className={styles.ftDevLink}
              onClick={() => trackLinkClick().catch(console.error)}
            >
              Desarrollado por Héctor Cobeña
            </a>
          </div>
        </div>

        {showWhatsAppFloating && <WhatsAppFloatingButton />}
      </footer>
    </>
  );
};

export default Footer;