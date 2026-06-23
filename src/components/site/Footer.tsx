export function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="container-page flex flex-col gap-8 py-14 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-lime-brand text-2xl font-black tracking-tight">
            Legacy<span className="text-cream">BrandCo.</span>
          </p>
          <p className="mt-3 max-w-sm text-sm text-cream/60">
            Consultoria de estratégia de marca e identidade visual.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm md:items-end">
          <div className="flex gap-6">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-lime-brand"
            >
              Instagram
            </a>
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-lime-brand"
            >
              WhatsApp
            </a>
          </div>
          <p className="text-cream/50">
            © 2025 Legacy BrandCo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
