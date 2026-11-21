import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { playSound } from "../utils/sound.js";

// An illustrative interaction model. This module never opens WebRTC, reads a
// visitor's page, or loads the GhostCursor extension.
type Tool = "cursor" | "click" | "laser" | "note";
const actions: { id: Tool; label: string; explanation: string }[] = [
  { id: "cursor", label: "Live cursor", explanation: "Move a pointer in one browser and watch it appear in the other." },
  { id: "click", label: "Click ripple", explanation: "A temporary click indicator appears in both local views." },
  { id: "laser", label: "Laser trail", explanation: "Illustrate a short, transient laser stroke across a page." },
  { id: "note", label: "Sticky note", explanation: "Attach an illustrative note to the chosen element in both views." },
];
const targets = [
  { id: "header", label: "Navigation", x: 74, y: 21 },
  { id: "hero", label: "Hero section", x: 30, y: 48 },
  { id: "card", label: "Feature card", x: 70, y: 76 },
] as const;
const phases = [
  { title: "Explicit activation", detail: "User opens a page-scoped collaboration room." },
  { title: "Validated messages", detail: "Bounded cursor, annotation and presence events." },
  { title: "Encrypted WebRTC", detail: "Peers exchange events over DataChannels." },
  { title: "Isolated overlay", detail: "Each browser renders its own cursors and notes." },
];
export default function GhostCursor() {
  const [tool, setTool] = useState<Tool>("cursor");
  const [target, setTarget] = useState(1);
  const [eventId, setEventId] = useState(0);
  const initialNote = "Review this component before launch.";
  const [noteDraft, setNoteDraft] = useState(initialNote);
  const [sharedNote, setSharedNote] = useState<{ text: string; anchor: number } | null>({ text: initialNote, anchor: 2 });
  function reset() {
    setTool("cursor");
    setTarget(1);
    setEventId(0);
    setNoteDraft(initialNote);
    setSharedNote({ text: initialNote, anchor: 2 });
    setEventText("Simulation reset.");
  }
  const [eventText, setEventText] = useState("Choose a tool, then select an element in either browser.");
  const page = useRef<HTMLDivElement>(null);
  const [anchors, setAnchors] = useState<{ x: number; y: number }[]>(targets.slice());
  useEffect(() => {
    const view = page.current;
    if (!view) return;
    const elements = Array.from(view.querySelectorAll<HTMLElement>("[data-anchor]"));
    const measure = () => {
      // Both peers use the same page template. Pin to the actual element box
      // so wrapping or a viewport change cannot detach the note or cursor.
      setAnchors(elements.map(el => ({
        x: (el.offsetLeft + el.offsetWidth * .72) / view.clientWidth * 100,
        y: (el.offsetTop + el.offsetHeight * .48) / view.clientHeight * 100,
      })));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(view);
    elements.forEach(el => observer.observe(el));
    measure();
    return () => observer.disconnect();
  }, []);
  const position = anchors[target];
  function activate(next: Tool) {
    setTool(next);
    setEventText(next === "note" ? "Choose an element, then share the example note." : actions.find(a => a.id === next)!.explanation);
    playSound("select");
  }
  function selectElement(index: number) {
    setTarget(index);
    setEventId(id => id + 1);
    // Selecting a target does not move an already shared note.
    // Its anchor updates only when Share locally is submitted.
    setEventText(tool === "cursor" ? `Alex points to ${targets[index].label}.` :
      tool === "click" ? `A click ripple appears on ${targets[index].label}.` :
      tool === "laser" ? `A temporary laser crosses ${targets[index].label}.` :
      `Selected ${targets[index].label} as the note anchor.`);
    playSound(tool === "click" ? "select" : "hover");
  }
  function shareNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = noteDraft.trim().slice(0, 120);
    if (!text) return;
    setSharedNote({ text, anchor: target });
    setEventText("The example note is visible in both local browser views.");
    playSound("success");
  }
  return (
    <div className="ghost-lab">
      <header className="ghost-intro">
        <div>
          <p className="eyebrow">GHOSTCURSOR / TWO BROWSERS, ONE WORKSPACE</p>
          <h4>Browse together. Point anywhere.</h4>
          <p>Collaborators often need to point at the same page element without sharing an entire screen. Try the extension’s shared pointers and annotations below.</p>
        </div>
        <div className="ghost-status"><span aria-hidden="true" /> Local simulation</div>
      </header>
      <p className="ghost-disclosure">This is a deterministic portfolio illustration, <strong>not a live WebRTC session</strong>. No room is created, no extension is installed, and nothing is sent to another device.</p>
      <div className="ghost-tools" role="group" aria-label="Choose an illustrative collaboration tool">
        {actions.map(action => (
          <button key={action.id} type="button" aria-pressed={tool === action.id} onClick={() => activate(action.id)}>
            <span>{action.label}</span>
            <small>{action.id === "cursor" ? "01" : action.id === "click" ? "02" : action.id === "laser" ? "03" : "04"}</small>
          </button>
        ))}
      </div>
      <p className="ghost-instruction">{actions.find(a => a.id === tool)!.explanation}</p>
      <div className="ghost-browser-pair">
        {["Alex / Chrome", "Sam / Firefox"].map((peer, peerIndex) => (
          <div className="ghost-browser" key={peer}>
            <div className="ghost-browser-chrome">
              <span className="ghost-browser-dots" aria-hidden="true"><i /><i /><i /></span>
              <span className="ghost-browser-url">example.test / workspace</span>
              <span className="ghost-browser-peer">{peer}</span>
            </div>
            <div className="ghost-page" ref={peerIndex === 0 ? page : undefined}>
              <div data-anchor="header" className="ghost-page-head"><span>COMMON GROUND</span><span>WORKSPACE / 01</span></div>
              <div data-anchor="hero" className="ghost-page-copy"><span className="ghost-kicker">Build with clarity</span><strong>Ideas worth<br />pointing at.</strong><span>Shared context, without the screen-share meeting.</span></div>
              <div data-anchor="card" className="ghost-page-card"><span>01 — THE DETAIL</span><b>Reviewable by design</b><span>Annotations stay attached to visible elements.</span></div>
              <div className="ghost-targets" role="group" aria-label={peer + " selectable example elements"}>
                {targets.map((item, i) => (
                  <button key={item.id} className={"ghost-target ghost-target-" + item.id} style={{ left: anchors[i].x + "%", top: anchors[i].y + "%" }}
                    aria-label={`Select ${item.label} in ${peer}`} aria-pressed={target === i} data-pinned={sharedNote?.anchor === i}
                    onClick={() => selectElement(i)} type="button"><span className="sr-only">{item.label}</span></button>
                ))}
              </div>
              <div className="ghost-pointer" style={{ "--cursor-x": position.x + "%", "--cursor-y": position.y + "%" } as CSSProperties} aria-hidden="true">
                <svg width="20" height="26" viewBox="0 0 20 26" fill="none"><path d="M2 2v20l5.5-5.3 4.4 7 3.1-1.8-4.4-7H18L2 2Z" fill="#B8F4CE" stroke="#122229" strokeWidth="1.8"/></svg>
                <span>Alex</span>
              </div>
              {tool === "click" && <div key={eventId} className="ghost-ripple" style={{ left: position.x + "%", top: position.y + "%" }} aria-hidden="true" />}
              {tool === "laser" && <svg key={eventId} className="ghost-laser" viewBox="0 0 400 290" preserveAspectRatio="none" aria-hidden="true"><path d={`M ${position.x * 4 - 70} ${position.y * 2.9 + 25} Q ${position.x * 4 + 4} ${position.y * 2.9 - 65} ${position.x * 4 + 85} ${position.y * 2.9 - 8}`} /></svg>}
              <span className="ghost-browser-footer">LOCAL DISPLAY · {peerIndex ? "PEER B" : "PEER A"}</span>
            </div>
            <div className="ghost-note">
              {sharedNote ? <><span>Pinned to {targets[sharedNote.anchor].label}</span><p>{sharedNote.text}</p></> : <span>No shared note</span>}
            </div>
          </div>
        ))}
      </div>
      <div className="ghost-workbench">
        <div className="ghost-event" role="status" aria-live="polite"><span>EVENT / LOCAL MODEL</span><strong>{eventText}</strong><small>Both windows render the same example state. No network packets are sent.</small></div>
        <form className="ghost-note-form" onSubmit={shareNote}>
          <label htmlFor="ghost-note-input">Draft note for {targets[target].label}</label>
          <div>
            <input id="ghost-note-input" maxLength={120} value={noteDraft} onChange={e => setNoteDraft(e.target.value)} />
            <button type="submit" disabled={!noteDraft.trim()}>Share locally</button>
          </div>
          <button type="button" className="ghost-clear" onClick={() => { setSharedNote(null); setEventText("Example note cleared in both views."); }}>Delete shared note</button>
          <button type="button" className="ghost-clear" onClick={reset}>Reset simulation</button>
        </form>
      </div>
      <div className="ghost-evidence">
        <div><p className="eyebrow">UNDER THE HOOD</p><h4>Peer-to-peer by architecture.</h4><p>The real extension uses browser-specific session hosts, validated protocol messages, encrypted DataChannels, and an isolated page overlay.</p></div>
        <ol className="ghost-flow">{phases.map((phase, index) => <li key={phase.title}><span>0{index + 1}</span><strong>{phase.title}</strong><small>{phase.detail}</small></li>)}</ol>
      </div>
      <div className="ghost-proof" aria-label="Documented GhostCursor verification results">
        <div><strong>106</strong><span>Unit tests</span></div><div><strong>9</strong><span>Browser tests</span></div><div><strong>2</strong><span>Browser engines</span></div><div><strong>v0.3</strong><span>Prototype</span></div>
      </div>
      <p className="demo-note">These results are documented for the Phase 3 prototype in its verification report. Browser tests used locally signaled, real WebRTC; public cross-network connectivity and store release are not verified.</p>
      <div className="ghost-captures">
        {["chromium", "firefox"].map(browser => <figure key={browser}>
          <a href={`https://github.com/Prabin-Poudel-1/ghost-curser/blob/feature/ghostcursor-phase3/docs/images/phase3-${browser}.png`} target="_blank" rel="noopener noreferrer">
            <img src={`assets/projects/ghostcursor-${browser}.webp`} width="1200" height="915" loading="lazy" alt={`Open the original GhostCursor Phase 3 ${browser} verification capture`} />
          </a><figcaption>Phase 3 verification · {browser === "chromium" ? "Chromium" : "Firefox"}</figcaption>
        </figure>)}
      </div>
      <div className="ghost-links">
        <a href="https://github.com/Prabin-Poudel-1/ghost-curser/tree/feature/ghostcursor-phase3" target="_blank" rel="noopener noreferrer">Browse Phase 3 source ↗</a>
        <a href="https://github.com/Prabin-Poudel-1/ghost-curser/blob/feature/ghostcursor-phase3/docs/VERIFICATION.md" target="_blank" rel="noopener noreferrer">Verification report ↗</a>
        <a href="https://github.com/Prabin-Poudel-1/ghost-curser/blob/feature/ghostcursor-phase3/docs/images/phase3-chromium.png" target="_blank" rel="noopener noreferrer">Actual browser screenshot ↗</a>
      </div>
    </div>
  );
}
