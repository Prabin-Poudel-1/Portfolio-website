document.addEventListener("DOMContentLoaded", () => {
  const themeButton = document.getElementById("themeToggle");
  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    themeButton.textContent = theme === "dark" ? "Light mode" : "Dark mode";
    themeButton.setAttribute(
      "aria-label",
      `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
    );
  };
  let savedTheme = "dark";
  try {
    savedTheme = localStorage.getItem("theme") || "dark";
  } catch (_) {
    /* Storage is optional. */
  }
  applyTheme(savedTheme === "light" ? "light" : "dark");
  themeButton.addEventListener("click", () => {
    const theme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(theme);
    try {
      localStorage.setItem("theme", theme);
    } catch (_) {
      /* Keep the in-page preference. */
    }
  });
  const menu = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".navbar");
  const closeMenu = () => {
    nav.classList.remove("active");
    menu.setAttribute("aria-expanded", "false");
  };
  document.body.classList.add("js-ready");
  menu.addEventListener("click", () => {
    const open = nav.classList.toggle("active");
    menu.setAttribute("aria-expanded", String(open));
  });
  nav
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("active")) {
      closeMenu();
      menu.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".header")) closeMenu();
  });
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
  // Progressive enhancements: content and screenshot links work without JS.
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const narrow = window.matchMedia("(max-width: 800px)");
  narrow.addEventListener("change", closeMenu);
  document.addEventListener("focusin", (event) => {
    if (!event.target.closest(".header")) closeMenu();
  });
  const sectionLinks = [...document.querySelectorAll(".navbar a, .case-nav a")];
  const localLinks = sectionLinks.filter((link) => {
    const url = new URL(link.href);
    return (
      url.pathname === location.pathname &&
      url.hash &&
      document.getElementById(url.hash.slice(1))
    );
  });
  // The index may be served as either / or /index.html.
  document.querySelectorAll(".navbar, .case-nav").forEach((navigation) => {
    const entries = localLinks
      .filter((link) => navigation.contains(link))
      .map((link) => ({
        link,
        section: document.getElementById(new URL(link.href).hash.slice(1)),
      }));
    if (!entries.length) return;
    let scheduled = false;
    const updateCurrent = () => {
      scheduled = false;
      const offset =
        document.querySelector(".header").getBoundingClientRect().height + 100;
      let current = entries
        .filter(({ section }) => section.getBoundingClientRect().top <= offset)
        .at(-1);
      if (
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 8
      )
        current = entries.at(-1);
      entries.forEach(({ link }) => {
        if (link === current?.link)
          link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!scheduled) {
          scheduled = true;
          requestAnimationFrame(updateCurrent);
        }
      },
      { passive: true },
    );
    window.addEventListener("resize", updateCurrent);
    updateCurrent();
  });
  localLinks.forEach((link) =>
    link.addEventListener("click", () => {
      const section = document.getElementById(new URL(link.href).hash.slice(1));
      section.setAttribute("tabindex", "-1");
      section.focus({ preventScroll: true });
    }),
  );
  if ("IntersectionObserver" in window) {
    const running = new Set();
    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return;
          reveal.unobserve(target);
          if (motion.matches || target.matches(":focus-within")) return;
          const animation = target.animate(
            [
              { opacity: 0.6, transform: "translateY(10px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 360, easing: "cubic-bezier(.2,.7,.2,1)" },
          );
          running.add(animation);
          animation.finished
            .then(() => running.delete(animation))
            .catch(() => running.delete(animation));
        });
      },
      { threshold: 0.08 },
    );
    document
      .querySelectorAll("main > section, .case-main > section")
      .forEach((section) => {
        if (section.getBoundingClientRect().top >= window.innerHeight)
          reveal.observe(section);
      });
    motion.addEventListener("change", () => {
      if (motion.matches) running.forEach((animation) => animation.cancel());
    });
  }
  const gallery = [
    ...document.querySelectorAll(".screenshot-gallery .device-frame"),
  ];
  if (gallery.length && typeof HTMLDialogElement !== "undefined") {
    const dialog = document.createElement("dialog");
    dialog.className = "image-dialog";
    dialog.setAttribute("aria-label", "Application screenshot viewer");
    dialog.innerHTML = `<div class="viewer-toolbar"><p id="viewer-caption" aria-live="polite"></p><button type="button" class="button" data-close autofocus aria-label="Close screenshot viewer">Close ×</button></div><img class="viewer-image" alt="" /><div class="viewer-controls"><button type="button" class="button" data-previous aria-label="Previous screenshot">← Previous</button><a class="text-link" target="_blank" rel="noopener noreferrer">Full size ↗<span class="sr-only"> (opens in a new tab)</span></a><button type="button" class="button" data-next aria-label="Next screenshot">Next →</button></div>`;
    document.body.append(dialog);
    const image = dialog.querySelector("img");
    const caption = dialog.querySelector("#viewer-caption");
    const fullSize = dialog.querySelector("a");
    let index = 0;
    let opener;
    const showImage = (next) => {
      index = (next + gallery.length) % gallery.length;
      const original = gallery[index].querySelector("img");
      image.src = original.src;
      image.alt = original.alt;
      image.width = original.width;
      image.height = original.height;
      caption.textContent = `${index + 1} / ${gallery.length} · ${original.alt}`;
      fullSize.href = gallery[index].href;
    };
    gallery.forEach((link, position) => {
      link.setAttribute("aria-haspopup", "dialog");
      link.setAttribute(
        "aria-label",
        `View ${link.querySelector("img").alt.toLowerCase()} in screenshot viewer`,
      );
      link.addEventListener("click", (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
          return;
        event.preventDefault();
        opener = link;
        showImage(position);
        dialog.showModal();
        document.documentElement.classList.add("viewer-open");
      });
    });
    dialog
      .querySelector("[data-close]")
      .addEventListener("click", () => dialog.close());
    dialog
      .querySelector("[data-previous]")
      .addEventListener("click", () => showImage(index - 1));
    dialog
      .querySelector("[data-next]")
      .addEventListener("click", () => showImage(index + 1));
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        const controls = [...dialog.querySelectorAll("button, a[href]")];
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        showImage(index + (event.key === "ArrowRight" ? 1 : -1));
      }
    });
    dialog.addEventListener("click", (event) => {
      const box = dialog.getBoundingClientRect();
      if (
        event.target === dialog &&
        (event.clientX < box.left ||
          event.clientX > box.right ||
          event.clientY < box.top ||
          event.clientY > box.bottom)
      )
        dialog.close();
    });
    dialog.addEventListener("close", () => {
      document.documentElement.classList.remove("viewer-open");
      opener?.focus({ preventScroll: true });
    });
  }
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const button = form.querySelector('[type="submit"]');
    if (button.disabled) return;
    const status = document.getElementById("form-status");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    button.disabled = true;
    status.textContent = "Sending your message…";
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbwe5wykAIaNS_0YtlZNDwx2INqhQnizMzxueJp-MPLSyaux4LuSzjSlzk0IhMBW4_ZyZg/exec",
        { method: "POST", body: new FormData(form), signal: controller.signal },
      );
      if (!response.ok) throw new Error("Request failed");
      const result = await response.json();
      if (result.result !== "success")
        throw new Error("Message was not accepted");
      form.reset();
      status.textContent = "Thank you! Your message has been sent.";
    } catch (_) {
      status.textContent =
        "Could not confirm delivery. Your message is still here. Please try again or email prabinpoudel702@gmail.com.";
    } finally {
      clearTimeout(timeout);
      button.disabled = false;
    }
  });
});
