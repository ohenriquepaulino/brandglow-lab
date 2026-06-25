import { Link } from "@tanstack/react-router";
import { useState } from "react";
import logoAsset from "@/assets/logo-legacy-v2.png.asset.json";

const links = [
  { label: "Cases", hash: "cases" },
  { label: "Processo", hash: "processo" },
  { label: "Contato", hash: "contato" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-background/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center" aria-label="Legacy BrandCo. — Início">
          <img src={logoAsset.url} alt="Legacy BrandCo." className="h-10 w-auto md:h-12" />
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {links.map((l) => (
            <a
              key={l.label}
              href={`/#${l.hash}`}
              className="text-sm font-normal text-ink/70 transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-ink"
          aria-label="Abrir menu"
        >
          <div className="flex flex-col gap-1.5">
            <span className="h-px w-6 bg-ink" />
            <span className="h-px w-6 bg-ink" />
          </div>
        </button>
      </div>

      {open && (
        <div className="border-t border-ink/10 md:hidden">
          <nav className="container-page flex flex-col gap-4 py-6">
            {links.map((l) => (
              <a
                key={l.label}
                href={`/#${l.hash}`}
                onClick={() => setOpen(false)}
                className="text-base text-ink/80 hover:text-ink"
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
