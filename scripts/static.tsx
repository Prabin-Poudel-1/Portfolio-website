import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { readFileSync, writeFileSync, cpSync } from "node:fs";
import { App } from "../src/App";
// Real static pages preserve direct GitHub Pages URLs, metadata and no-JS content.
for (const file of [
  "assets",
  "cv.pdf",
  "CNAME",
  "style.css",
  "script.js",
  "contact.js",
  "contact-config.js",
  "sentinel-ai.html",
  "rescuer-sathi.html",
  "chitwan-care.html",
])
  cpSync(file, "dist/" + file, { recursive: true });
const shell = readFileSync("dist/index.html", "utf8");
for (const [file, url] of [
  ["index.html", "/"],
  ["404.html", "/missing"],
])
  writeFileSync(
    "dist/" + file,
    shell.replace(
      "<!--app-->",
      renderToString(
        <StaticRouter location={url}>
          <App />
        </StaticRouter>,
      ),
    ),
  );
