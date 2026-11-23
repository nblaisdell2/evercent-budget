import type { MetadataRoute } from "next";
import { isDevEnvironment } from "@/lib/app-environment";

/**
 * /robots.txt. The private dev site turns every crawler away (the root
 * layout's metadata also marks its pages noindex); production allows them.
 */
export default function robots(): MetadataRoute.Robots {
  if (isDevEnvironment()) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/" } };
}
