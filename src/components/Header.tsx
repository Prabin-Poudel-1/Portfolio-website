import React, { useEffect, useRef, useState } from "react";
const links = [
  ["portfolio", "Projects"],
  ["expertise", "Expertise"],
  ["skill", "Skills"],
  ["about", "About"],
  ["contact", "Contact"],
];
export function Header() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [active, setActive] = useState("");
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    document.documentElement.classList.add("react-ready");
    setTheme(document.documentElement.dataset.theme || "dark");
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const outside = (e: Event) => {
      if (!header.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-15% 0px -55% 0px" },
    );
    links.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => {
      observer.disconnect();
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", outside);
    };
  }, []);
  function changeTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }
  return (
    <header className="header" ref={header}>
      <div className="nav-wrap">
        <a className="logo" href="/#home">
          pp<span>.</span>
          <span className="logo-caption">PRABIN POUDEL</span>
        </a>
        <nav
          id="navigation"
          className={"navbar " + (open ? "active" : "")}
          aria-label="Main navigation"
        >
          {links.map(([id, label]) => (
            <a
              key={id}
              href={"/#" + id}
              aria-current={active === id ? "location" : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <button
            type="button"
            onClick={changeTheme}
            aria-label={
              "Switch to " + (theme === "dark" ? "light" : "dark") + " mode"
            }
          >
            {theme === "dark" ? "☼ Light" : "◐ Dark"}
          </button>
          <button
            ref={toggle}
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="navigation"
            onClick={() => setOpen(!open)}
          >
            Menu {open ? "−" : "+"}
          </button>
        </div>
      </div>
    </header>
  );
}
