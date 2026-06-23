export function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="container-page flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-semibold tracking-tight">Legacy BrandCo.</p>

        <div className="flex gap-6 text-xs text-cream/70">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cream"
          >
            Instagram
          </a>
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cream"
          >
            WhatsApp
          </a>
        </div>

        <p className="text-xs text-cream/50">
          © 2025 Legacy BrandCo.
        </p>
      </div>
    </footer>
  );
}
