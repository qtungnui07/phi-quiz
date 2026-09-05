/**
 * Entry point for the PhiQuiz SPA.
 *
 * The compiled stylesheet is served at /index.css by the dev/production
 * server (see src/index.ts). We load it here and inject it into the
 * document, so the HTML stays free of asset references the Bun dev
 * bundler would otherwise try to resolve.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

const styleEl = document.createElement("style");
styleEl.setAttribute("data-phiquiz", "");
document.head.appendChild(styleEl);

fetch("/index.css")
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to load styles: ${response.status}`);
    }
    return response.text();
  })
  .then(css => {
    styleEl.textContent = css;
  })
  .catch(() => {
    // Styles are best effort; the app still renders without them.
  });

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// https://bun.com/docs/bundler/hot-reloading#import-meta-hot-data
(import.meta.hot.data.root ??= createRoot(elem)).render(app);