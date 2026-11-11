import React, { useEffect, useRef, useState } from "react";
import { projects } from "../data/projects";
import { playSound } from "../utils/sound.js";
const commands = [
  ...["Projects", "Expertise", "Skills", "About", "Contact"].map((name, i) => ({
    name,
    url: "/#" + ["portfolio", "expertise", "skill", "about", "contact"][i],
    project: "",
  })),
  ...projects.map((p) => ({ name: p.name, url: "/#portfolio", project: p.id })),
  {
    name: "GitHub profile",
    url: "https://github.com/Prabin-Poudel-1",
    project: "",
  },
  {
    name: "LinkedIn profile",
    url: "https://www.linkedin.com/in/prabin-poudel-556180329",
    project: "",
  },
];
export function CommandPalette() {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const found = commands.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  );
  useEffect(() => {
    if (dialog.current?.open)
      document
        .getElementById("command-" + selected)
        ?.scrollIntoView({ block: "nearest" });
  }, [selected]);
  function close() {
    dialog.current?.close();
    playSound("close");
    returnFocus.current?.focus();
  }
  function open() {
    returnFocus.current = document.activeElement as HTMLElement;
    setQuery("");
    setSelected(0);
    dialog.current?.showModal();
    input.current?.focus();
    playSound("open");
  }
  function choose(i: number) {
    const command = found[i];
    if (!command) return;
    close();
    if (command.project && document.getElementById("portfolio")) {
      window.dispatchEvent(
        new CustomEvent("portfolio:project", { detail: command.project }),
      );
      document
        .getElementById("portfolio")
        ?.scrollIntoView({
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
        });
      document
        .querySelector<HTMLElement>(".cinema")
        ?.focus({ preventScroll: true });
    } else window.location.assign(command.url);
  }
  useEffect(() => {
    const shortcut = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === "k" &&
        !e.altKey
      ) {
        e.preventDefault();
        if (dialog.current?.open) close();
        else open();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  return (
    <>
      <button
        className="command-launch"
        type="button"
        onClick={open}
        aria-label="Open command palette"
      >
        ⌘ K
      </button>
      <dialog
        ref={dialog}
        className="command-dialog"
        aria-labelledby="command-heading"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setSelected(
              (s) =>
                (s + (e.key === "ArrowDown" ? 1 : -1) + found.length) %
                Math.max(found.length, 1),
            );
          }
          if (e.key === "Enter" && e.target === input.current) {
            e.preventDefault();
            choose(selected);
          }
        }}
      >
        <div className="command-inner">
          <div className="command-title">
            <h2 id="command-heading">Where would you like to go?</h2>
            <button onClick={close} aria-label="Close command palette">
              Esc
            </button>
          </div>
          <label className="sr-only" htmlFor="command-query">
            Search sections and projects
          </label>
          <input
            ref={input}
            id="command-query"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            placeholder="Search projects, pages, people…"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-results"
            aria-activedescendant={
              found.length ? "command-" + selected : undefined
            }
            autoComplete="off"
          />
          <div
            id="command-results"
            role="listbox"
            aria-label="Navigation commands"
          >
            {found.map((c, i) => (
              <div
                key={c.name}
                id={"command-" + i}
                role="option"
                aria-selected={i === selected}
                onMouseEnter={() => setSelected(i)}
              >
                <button tabIndex={-1} onClick={() => choose(i)}>
                  {c.name}
                  <span>↗</span>
                </button>
              </div>
            ))}
          </div>
          {!found.length && <p role="status">No matching commands.</p>}
          <p className="command-help">
            ↑ ↓ navigate · Enter select · Escape close
          </p>
        </div>
      </dialog>
    </>
  );
}
