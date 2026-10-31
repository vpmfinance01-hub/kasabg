import type { NextConfig } from "next";

import path from "node:path";

const nextConfig: NextConfig = {
  // самостоятелен сървър за собствен VPS (във Vercel не пречи)
  output: "standalone",
  outputFileTracingRoot: path.join(import.meta.dirname),
  // шрифтовете за PDF се четат от диска и не се засичат автоматично
  outputFileTracingIncludes: { "/api/receipt-pdf": ["./src/assets/fonts/*"] },
};

export default nextConfig;
