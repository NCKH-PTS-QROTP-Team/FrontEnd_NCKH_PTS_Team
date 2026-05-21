const IONICONS_CDN =
  "https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/Ionicons.ttf";

const STYLE_ID = "ionicons-font-face";

/** Inject @font-face vào <head> — chạy sync trước khi render icon (expo export không dùng +html.tsx). */
export function ensureIoniconsFontWeb(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @font-face {
      font-family: ionicons;
      src: url('${IONICONS_CDN}') format('truetype');
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
}

export const IONICONS_FONT_URL = IONICONS_CDN;
