import logoAsset from "@/assets/logo-legacy.png.asset.json";

export function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="container-page flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between">
        <img src={logoAsset.url} alt="Legacy BrandCo." className="h-6 w-auto opacity-90" />
        <p className="text-xs text-cream/50">© 2026 Legacy BrandCo.</p>
      </div>
    </footer>
  );
}
