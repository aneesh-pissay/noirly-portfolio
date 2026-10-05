function hostFromEnvUrl(value: string | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    return new URL(value.trim()).hostname;
  } catch {
    return null;
  }
}

export function resolveProjectLogoUrl(src: string, baseUrl: string): string | null {
  try {
    if (src.startsWith("/")) {
      return new URL(src, baseUrl).href;
    }
    return new URL(src).href;
  } catch {
    return null;
  }
}

export function isAllowedProjectLogoUrl(absoluteUrl: string, requestOrigin: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(absoluteUrl);
  } catch {
    return false;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return false;
  }

  const allowedHosts = new Set<string>();

  for (const host of [
    hostFromEnvUrl(process.env.R2_PUBLIC_URL),
    hostFromEnvUrl(requestOrigin),
  ]) {
    if (host) allowedHosts.add(host);
  }

  allowedHosts.add("localhost");
  allowedHosts.add("127.0.0.1");

  const hostname = parsed.hostname;
  if (allowedHosts.has(hostname)) return true;
  if (hostname.endsWith(".r2.dev")) return true;
  if (hostname.endsWith(".r2.cloudflarestorage.com")) return true;

  return false;
}
