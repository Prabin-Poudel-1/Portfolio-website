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
    (file === "404.html"
      ? shell
          .replace(
            /<title>[\s\S]*?<\/title>/,
            '<title>Page not found | Prabin Poudel</title><meta name="robots" content="noindex" />',
          )
          .replace(/<link rel="canonical"[^>]*>/, "")
      : shell
    ).replace(
      "<!--app-->",
      renderToString(
        <StaticRouter location={url}>
          <App />
        </StaticRouter>,
      ),
    ),
  );

const publicRoutes = [
  "",
  "sentinel-ai.html",
  "rescuer-sathi.html",
  "chitwan-care.html",
];
writeFileSync(
  "dist/sitemap.xml",
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    publicRoutes
      .map(
        (route) =>
          `<url><loc>https://www.poudelprabin.com.np/${route}</loc></url>`,
      )
      .join("") +
    "</urlset>",
);
writeFileSync(
  "dist/robots.txt",
  "User-agent: *\nAllow: /\nSitemap: https://www.poudelprabin.com.np/sitemap.xml\n",
);
