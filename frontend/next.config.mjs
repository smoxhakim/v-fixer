/** @type {import('next').NextConfig} */
function buildMediaRemotePatterns() {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";
  try {
    const u = new URL(raw);
    const protocol = u.protocol === "https:" ? "https" : "http";
    const entry = {
      protocol,
      hostname: u.hostname,
      pathname: "/media/**",
      ...(u.port ? { port: u.port } : {}),
    };
    return [
      entry,
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ];
  } catch {
    return [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8001",
        pathname: "/media/**",
      },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ];
  }
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

export default nextConfig
