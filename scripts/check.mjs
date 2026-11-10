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
])
  assert.deepEqual(
    readFileSync("dist/" + name),
    execFileSync("git", ["show", "master:" + name], { maxBuffer: 10000000 }),
    name + " preserved",
  );
assert(html.includes("Trained") || html.includes("Model training"));
assert(html.includes("<main"));
console.log(
  "PASS: static HTML, local assets, original CV/domain/case-study byte preservation",
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
    window: {
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
