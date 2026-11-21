import { useState, type CSSProperties, type FormEvent } from "react";
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
  const [noteDraft, setNoteDraft] = useState("Review this component before launch.");
  const [noteText, setNoteText] = useState("Review this component before launch.");
  const [noteTarget, setNoteTarget] = useState(2);
  const [noteVisible, setNoteVisible] = useState(true);
  const [eventText, setEventText] = useState("Choose a tool, then select an element in either browser.");
  const position = targets[target];
  function activate(next: Tool) {
    setTool(next);
    setEventText(next === "note" ? "Choose an element, then share the example note." : actions.find(a => a.id === next)!.explanation);
    playSound("select");
  }
  function selectElement(index: number) {
    setTarget(index);
    setEventId(id => id + 1);
    if (tool === "note") setNoteTarget(index);
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
    setNoteText(text);
    setNoteVisible(true);
    setNoteTarget(target);
    setEventText("The example note is visible in both local browser views.");
    playSound("success");
  }
  return (
    <div className="ghost-lab">
      <header className="ghost-intro">
        <div>
          <p className="eyebrow">GHOSTCURSOR / TWO BROWSERS, ONE WORKSPACE</p>
          <h4>Point together. Without sharing a screen.</h4>
          <p>Try the interaction vocabulary behind a peer-to-peer collaboration extension.</p>
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
            <div className="ghost-page">
              <div className="ghost-page-head"><span>COMMON GROUND</span><span>WORKSPACE / 01</span></div>
              <div className="ghost-page-copy"><span className="ghost-kicker">Build with clarity</span><strong>Ideas worth<br />pointing at.</strong><span>Shared context, without the screen-share meeting.</span></div>
              <div className="ghost-page-card"><span>01 — THE DETAIL</span><b>Reviewable by design</b><span>Annotations stay attached to visible elements.</span></div>
              <div className="ghost-targets" role="group" aria-label={peer + " selectable example elements"}>
                {targets.map((item, i) => (
                  <button key={item.id} className={"ghost-target ghost-target-" + item.id} style={{ left: item.x + "%", top: item.y + "%" }}
                    aria-label={`Select ${item.label} in ${peer}`} aria-pressed={target === i}
                    onClick={() => selectElement(i)} type="button"><span className="sr-only">{item.label}</span></button>
                ))}
              </div>
              <div className="ghost-pointer" style={{ "--cursor-x": position.x + "%", "--cursor-y": position.y + "%" } as CSSProperties} aria-hidden="true">
                <svg width="20" height="26" viewBox="0 0 20 26" fill="none"><path d="M2 2v20l5.5-5.3 4.4 7 3.1-1.8-4.4-7H18L2 2Z" fill="#B8F4CE" stroke="#122229" strokeWidth="1.8"/></svg>
                <span>Alex</span>
              </div>
              {tool === "click" && <div key={eventId} className="ghost-ripple" style={{ left: position.x + "%", top: position.y + "%" }} aria-hidden="true" />}
              {tool === "laser" && <svg key={eventId} className="ghost-laser" viewBox="0 0 400 290" preserveAspectRatio="none" aria-hidden="true"><path d={`M ${position.x * 4 - 70} ${position.y * 2.9 + 25} Q ${position.x * 4 + 4} ${position.y * 2.9 - 65} ${position.x * 4 + 85} ${position.y * 2.9 - 8}`} /></svg>}
              {noteVisible && <div className="ghost-note" style={{ top: noteTarget === 0 ? "34%" : noteTarget === 1 ? "59%" : "70%" }}><span>NOTE / ALEX</span><p>{noteText}</p></div>}
              <span className="ghost-browser-footer">LOCAL DISPLAY · {peerIndex ? "PEER B" : "PEER A"}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="ghost-workbench">
        <div className="ghost-event" role="status" aria-live="polite"><span>EVENT / LOCAL MODEL</span><strong>{eventText}</strong><small>Both windows render the same example state. No network packets are sent.</small></div>
        <form className="ghost-note-form" onSubmit={shareNote}>
          <label htmlFor="ghost-note-input">Edit the example note</label>
          <div>
            <input id="ghost-note-input" maxLength={120} value={noteDraft} onChange={e => setNoteDraft(e.target.value)} />
            <button type="submit">Share locally</button>
          </div>
          <button type="button" className="ghost-clear" onClick={() => { setNoteVisible(false); setEventText("Example note cleared in both views."); }}>Clear note</button>
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
      <div className="ghost-links">
        <a href="https://github.com/Prabin-Poudel-1/ghost-curser/tree/feature/ghostcursor-phase3" target="_blank" rel="noopener noreferrer">Browse Phase 3 source ↗</a>
        <a href="https://github.com/Prabin-Poudel-1/ghost-curser/blob/feature/ghostcursor-phase3/docs/VERIFICATION.md" target="_blank" rel="noopener noreferrer">Verification report ↗</a>
        <a href="https://github.com/Prabin-Poudel-1/ghost-curser/blob/feature/ghostcursor-phase3/docs/images/phase3-chromium.png" target="_blank" rel="noopener noreferrer">Actual browser screenshot ↗</a>
      </div>
    </div>
  );
}
