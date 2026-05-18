import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
function buildMediaRemotePatterns() {
  const unsplash = {
    protocol: "https",
    hostname: "images.unsplash.com",
    pathname: "/**",
  };
  const patterns = [];
  const seen = new Set();

  function addFromEnv(raw) {
    if (raw == null || String(raw).trim() === "") return;
    const t = String(raw).trim();
    if (t.startsWith("/")) return;
    try {
      let s = t;
      if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
      s = s.replace(/\/api\/?$/i, "").replace(/\/+$/, "");
      const u = new URL(s);
      const key = `${u.protocol}//${u.hostname}:${u.port || "default"}`;
      if (seen.has(key)) return;
      seen.add(key);
      patterns.push({
        protocol: u.protocol === "https:" ? "https" : "http",
        hostname: u.hostname,
        pathname: "/media/**",
        ...(u.port ? { port: u.port } : {}),
      });
    } catch {
      /* ignore */
    }
  }

  addFromEnv(process.env.NEXT_PUBLIC_MEDIA_BASE_URL);
  addFromEnv(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api");

  if (patterns.length === 0) {
    patterns.push({
      protocol: "http",
      hostname: "localhost",
      port: "8001",
      pathname: "/media/**",
    });
  }

  patterns.push(unsplash);
  return patterns;
}

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: buildMediaRemotePatterns(),
  },
}

export default withNextIntl(nextConfig);

