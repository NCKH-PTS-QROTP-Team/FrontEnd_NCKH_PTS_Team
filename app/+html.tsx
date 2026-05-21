import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

/** Phải khớp font-family trong @expo/vector-icons/build/Ionicons.js → 'ionicons' */
const IONICONS_FONT = "ionicons";
const IONICONS_CDN =
  "https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/Ionicons.ttf";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="vi">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link
          rel="preload"
          href={IONICONS_CDN}
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @font-face {
                font-family: ${IONICONS_FONT};
                src: url('${IONICONS_CDN}') format('truetype');
                font-display: swap;
              }
            `,
          }}
        />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
