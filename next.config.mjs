/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === "production";

// Derive origin only — CSP needs scheme://host[:port], NOT a full URL with /api path.
function toOrigin(u) {
  try { return new URL(u).origin; } catch { return u; }
}
const rawApi   = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
const apiHttp  = toOrigin(rawApi);
const apiWs    = apiHttp.replace(/^http/, "ws");

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // 'unsafe-eval' kept always — Google Identity Services + Stripe.js use eval. Vercel
  // Speed Insights is on a separate origin and gets allowlisted explicitly.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://js.stripe.com https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  `connect-src 'self' ${apiHttp} ${apiWs} https://api.stripe.com https://accounts.google.com https://*.vercel-insights.com https://va.vercel-scripts.com`,
  "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://accounts.google.com",
  "form-action 'self' https://checkout.stripe.com",
  "worker-src 'self' blob:",
];

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp.join("; ") },
  { key: "X-Content-Type-Options",  value: "nosniff" },
  { key: "X-Frame-Options",         value: "DENY" },
  { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",      value: "camera=(), microphone=(), geolocation=()" },
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
