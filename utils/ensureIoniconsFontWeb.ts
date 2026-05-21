const IONICONS_CDN =
  "/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf";

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
