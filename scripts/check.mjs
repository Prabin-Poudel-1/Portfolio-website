import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import vm from "node:vm";
const html = readFileSync("dist/index.html", "utf8");
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const url = match[1].split(/[?#]/)[0];
  if (!url || /^(https?:|mailto:|tel:)/.test(url)) continue;
  assert(existsSync("dist/" + url.replace(/^\//, "")), url);
}
for (const name of [
  "cv.pdf",
  "CNAME",
  "sentinel-ai.html",
  "rescuer-sathi.html",
  "chitwan-care.html",
]) {
  let actual = readFileSync("dist/" + name);
  if (name.endsWith(".html"))
    actual = Buffer.from(
      actual
        .toString("utf8")
        .replace(
          /^    <link rel="preload" href="\/assets\/fonts\/(?:spacegrotesk|manrope)-latin\.woff2" as="font" type="font\/woff2" crossorigin \/>\n/gm,
          "",
        )
        .replace(
          '    <link rel="stylesheet" href="theme.css?v=20261112" />\n',
          "",
        ),
    );
  assert.deepEqual(
    actual,
    execFileSync("git", ["show", "382d0cb:" + name], { maxBuffer: 10000000 }),
    name + " preserved",
  );
}
assert(html.includes("Trained") || html.includes("Model training"));
assert(html.includes("<main"));
console.log(
  "PASS: static HTML, local assets, original CV/domain bytes and case-study content preservation (only shared stylesheet/font preloads added)",
);
const source = readFileSync("src/utils/contact.js", "utf8").replace(
  "export function",
  "function",
);
for (const scenario of [
  "accepted",
  "rejected",
  "http-error",
  "malformed",
  "timeout",
]) {
  let submit,
    reset = false;
  const status = { textContent: "" },
    label = { textContent: "" },
    button = { disabled: false, querySelector: () => label };
  const form = {
    querySelector: () => button,
    querySelectorAll: () => [],
    reportValidity: () => true,
    elements: { website: { value: "" } },
    setAttribute() {},
    addEventListener(type, fn) {
      if (type === "submit") submit = fn;
    },
    reset() {
      reset = true;
    },
  };
  let time = 100000;
  const context = {
    AbortController,
    FormData: class {
      set() {}
    },
    setTimeout,
    clearTimeout,
    Date: {
      now: () => {
        time += 5000;
        return time;
      },
    },
    Event: class {
      constructor(type) {
        this.type = type;
      }
    },
    window: {
      dispatchEvent() {},
      PORTFOLIO_CONTACT: {
        enabled: true,
        provider: "web3forms",
        endpoint: "https://api.web3forms.com/submit",
        accessKey: "89353746-1974-4828-b549-493988050b62",
      },
    },
    document: {
      querySelector: () => null,
      getElementById: (id) =>
        id === "contact-form"
          ? form
          : id === "form-status"
            ? status
            : { textContent: "" },
    },
    fetch: async () => {
      if (scenario === "timeout")
        throw Object.assign(new Error(), { name: "AbortError" });
      return {
        ok: scenario !== "http-error",
        json: async () => {
          if (scenario === "malformed") throw new Error();
          return { success: scenario === "accepted" };
        },
      };
    },
  };
  vm.createContext(context);
  vm.runInContext(source + ";mountContact()", context);
  await submit({ preventDefault() {} });
  assert.equal(reset, scenario === "accepted");
  assert.equal(button.disabled, false);
  assert(
    status.textContent.includes(
      scenario === "accepted" ? "accepted" : "still here",
    ),
  );
  console.log("PASS contact mock:", scenario);
}
