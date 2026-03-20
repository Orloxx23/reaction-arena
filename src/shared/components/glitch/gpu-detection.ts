export interface GpuCapability {
  supported: boolean;
  tier: "high" | "low" | "none";
  prefersReducedMotion: boolean;
}

export function detectGpuCapability(): GpuCapability {
  if (typeof window === "undefined") {
    return { supported: false, tier: "none", prefersReducedMotion: false };
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    return { supported: false, tier: "none", prefersReducedMotion: true };
  }

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") || canvas.getContext("webgl");

    if (!gl) {
      return { supported: false, tier: "none", prefersReducedMotion };
    }

    const debugExt = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugExt) {
      const renderer = gl.getParameter(debugExt.UNMASKED_RENDERER_WEBGL) as string;
      const lower = renderer.toLowerCase();

      const isLowEnd =
        lower.includes("swiftshader") ||
        lower.includes("llvmpipe") ||
        lower.includes("software") ||
        lower.includes("microsoft basic render");

      if (isLowEnd) {
        return { supported: false, tier: "none", prefersReducedMotion };
      }

      const isIntegrated =
        lower.includes("intel") &&
        !lower.includes("iris xe") &&
        !lower.includes("iris plus");

      if (isIntegrated) {
        return { supported: true, tier: "low", prefersReducedMotion };
      }
    }

    canvas.remove();
    return { supported: true, tier: "high", prefersReducedMotion };
  } catch {
    return { supported: false, tier: "none", prefersReducedMotion: false };
  }
}
