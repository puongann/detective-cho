// /host/ and /play/ are one folder deep; public assets live at the site root.
export const assetUrl = (p) => (/^(https?:|data:|\/)/.test(p) ? p : '../' + p);

const cache = new Map();
/** Preload pictures so transitions never show a blank frame. */
export function preload(paths) {
  for (const p of paths) {
    if (!p || cache.has(p)) continue;
    const img = new Image();
    img.src = assetUrl(p);
    cache.set(p, img);
  }
}
