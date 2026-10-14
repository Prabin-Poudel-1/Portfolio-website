document.addEventListener("DOMContentLoaded", () => {
  const email = "contact@poudelprabin.com.np";
  const copy = document.querySelector(".copy-email");
  if (copy) {
    copy.hidden = false;
    copy.addEventListener("click", async () => {
      const feedback = document.getElementById("copy-status");
      try {
        await navigator.clipboard.writeText(email);
        feedback.textContent = "Email address copied.";
      } catch (_) {
        feedback.textContent = `Copy unavailable. Select the address above, or use the email link.`;
      }
    });
  }
  const form = document.getElementById("contact-form");
  if (!form) return;
  const config = window.PORTFOLIO_CONTACT || {};
  const button = form.querySelector('[type="submit"]');
  const label = button.querySelector("[data-submit-label]");
  const status = document.getElementById("form-status");
  const notice = document.getElementById("contact-availability");
  const ready =
    config.enabled === true &&
    ((config.provider === "web3forms" &&
      config.endpoint === "https://api.web3forms.com/submit" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        config.accessKey || "",
      )) ||
      (config.provider === "apps-script" &&
        /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(
          config.endpoint,
        )) ||
      (config.provider === "formspree" &&
        /^https:\/\/formspree\.io\/f\/[a-z0-9]+$/i.test(config.endpoint)));
  button.disabled = !ready;
  if (ready) {
    label.textContent = "Send message";
    notice.textContent = "Send a message here, or email me directly.";
  }
  const started = Date.now();
  let pending = false;
  let lastAccepted = 0;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!ready) {
      status.textContent = `Form delivery is not verified. Please email ${email}.`;
      return;
    }
    if (pending) return;
    for (const field of form.querySelectorAll("[required]")) {
      field.setCustomValidity(
        field.value.trim() ? "" : "Please complete this field.",
      );
      field.addEventListener("input", () => field.setCustomValidity(""), {
        once: true,
      });
    }
    if (!form.reportValidity()) return;
    if (form.elements.website.value || Date.now() - started < 2500) {
      status.textContent = "Please wait a moment and try again.";
      return;
    }
    if (Date.now() - lastAccepted < 30000) {
      status.textContent =
        "Your last message was accepted. Please wait before sending another.";
      return;
    }
    pending = true;
    button.disabled = true;
    form.setAttribute("aria-busy", "true");
    label.textContent = "Sending…";
    status.textContent = "Sending your message. Please keep this page open.";
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      config.timeoutMs || 15000,
    );
    try {
      const payload = new FormData(form);
      if (config.provider === "web3forms") {
        payload.set("access_key", config.accessKey);
        payload.set("subject", "New portfolio contact — Prabin Poudel");
        payload.set("from_name", "Portfolio contact form");
      }
      const response = await fetch(config.endpoint, {
        method: "POST",
        body: payload,
        headers: { Accept: "application/json" },
        redirect: "follow",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("HTTP failure");
      const result = await response.json();
      const accepted =
        config.provider === "web3forms"
          ? result.success === true
          : config.provider === "apps-script"
            ? result.result === "success"
            : result.ok === true;
      if (!accepted) throw new Error("No acceptance confirmation");
      lastAccepted = Date.now();
      form.reset();
      status.textContent =
        "Thank you—your message was accepted. I’ll reply by email.";
    } catch (error) {
      status.textContent = `${error.name === "AbortError" ? "The request timed out." : "Delivery could not be confirmed."} Your message is still here. It may have reached the server; avoid repeated submissions. You can email ${email} instead.`;
    } finally {
      clearTimeout(timer);
      pending = false;
      button.disabled = false;
      form.setAttribute("aria-busy", "false");
      label.textContent = "Send message";
    }
  });
});
