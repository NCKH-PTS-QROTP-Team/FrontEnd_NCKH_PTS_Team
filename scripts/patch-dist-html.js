/**
 * expo export -p web không merge app/+html.tsx vào dist/index.html.
 * Script này inject @font-face ionicons vào HTML sau build.
 */
const fs = require("fs");
const path = require("path");

const CDN =
  "https://cdn.jsdelivr.net/npm/react-native-vector-icons@10.0.0/Fonts/Ionicons.ttf";
const MARKER = "ionicons-font-face";
const SNIPPET = `
    <link rel="preload" href="${CDN}" as="font" type="font/ttf" crossorigin="anonymous" />
    <style id="${MARKER}">
      @font-face {
        font-family: ionicons;
        src: url('${CDN}') format('truetype');
        font-display: swap;
      }
    </style>`;

const indexPath = path.join(__dirname, "..", "dist", "index.html");

if (!fs.existsSync(indexPath)) {
  console.error("patch-dist-html: dist/index.html not found. Run expo export first.");
  process.exit(1);
}

let html = fs.readFileSync(indexPath, "utf8");

if (html.includes(MARKER)) {
  console.log("patch-dist-html: already patched.");
  process.exit(0);
}

if (!html.includes("</head>")) {
  console.error("patch-dist-html: no </head> in index.html");
  process.exit(1);
}

html = html.replace("</head>", `${SNIPPET}\n  </head>`);
fs.writeFileSync(indexPath, html, "utf8");
console.log("patch-dist-html: injected ionicons @font-face into dist/index.html");
