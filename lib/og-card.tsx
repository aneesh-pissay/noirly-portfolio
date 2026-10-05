import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";

/** Share-image size every platform accepts (1.91:1). */
export const OG_SIZE = { width: 1200, height: 630 };

const BG = "#0b0b0b";
const GOLD = "#C9A44A";
const TEXT = "#F5F5F5";
const MUTED = "rgba(245, 245, 245, 0.62)";

/**
 * A logo from public/, as a data URI the image renderer can draw. The marks
 * paint with `currentColor` and set it in a <style> rule, neither of which the
 * renderer understands, so the colour is written straight into the markup.
 */
async function logoDataUri(publicPath: string): Promise<string | null> {
  try {
    const svg = await readFile(join(process.cwd(), "public", publicPath), "utf8");
    const flat = svg
      .replace(/<style>[\s\S]*?<\/style>/g, "")
      .replaceAll("currentColor", GOLD);
    return `data:image/svg+xml;base64,${Buffer.from(flat).toString("base64")}`;
  } catch {
    return null;
  }
}

interface OgCardOptions {
  eyebrow: string;
  title: string;
  description: string;
  logo?: string | null;
}

/** The shared look for every link preview: dark plate, gold rule, big title. */
export async function renderOgCard({ eyebrow, title, description, logo }: OgCardOptions) {
  const logoSrc = logo ? await logoDataUri(logo) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: `radial-gradient(circle at 15% 0%, rgba(201,164,74,0.18), transparent 55%), ${BG}`,
          color: TEXT,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ width: 72, height: 6, borderRadius: 3, background: GOLD }} />
            <div
              style={{
                marginTop: 28,
                fontSize: 24,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: MUTED,
              }}
            >
              {eyebrow}
            </div>
          </div>
          {logoSrc ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 132,
                height: 132,
                borderRadius: 28,
                border: "1px solid rgba(201,164,74,0.35)",
                background: "rgba(201,164,74,0.12)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} width={92} height={92} alt="" />
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1.5 }}>
            {title}
          </div>
          <div style={{ marginTop: 24, fontSize: 30, lineHeight: 1.4, color: MUTED, maxWidth: 960 }}>
            {description}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: MUTED }}>
          <span>
            {profile.name} · {profile.role}
          </span>
          <span style={{ color: GOLD }}>aneesh-pissay.in</span>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
