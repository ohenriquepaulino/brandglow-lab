import { Link } from "@tanstack/react-router";
import { useState } from "react";

const links = [
  { label: "Cases", to: "/", hash: "cases" },
  { label: "Processo", to: "/", hash: "processo" },
  { label: "Contato", to: "/", hash: "contato" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-ink text-cream">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label="Legacy BrandCo. — Início">
          <span className="text-lime-brand text-xl font-black tracking-tight">
            Legacy<span className="text-cream">BrandCo.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.label}
              href={`/#${l.hash}`}
              className="text-sm font-semibold text-cream/80 transition-colors hover:text-lime-brand"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-cream"
          aria-label="Abrir menu"
        >
          <div className="flex flex-col gap-1.5">
            <span className="h-0.5 w-6 bg-cream" />
            <span className="h-0.5 w-6 bg-cream" />
          </div>
        </button>
      </div>

      {open && (
        <div className="border-t border-cream/10 md:hidden">
          <nav className="container-page flex flex-col gap-4 py-6">
            {links.map((l) => (
              <a
                key={l.label}
                href={`/#${l.hash}`}
                onClick={() => setOpen(false)}
                className="text-base font-semibold text-cream hover:text-lime-brand"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
