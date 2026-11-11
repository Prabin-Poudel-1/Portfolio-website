import { useState } from "react";
import { playSound } from "../utils/sound.js";
const reportStages = [
  "Submitted",
  "Admin verified",
  "Department assigned",
  "Cleanup evidence",
  "Completed",
];
function Care() {
  const [step, setStep] = useState(0),
    [report, setReport] = useState("Riverside");
  return (
    <div className="demo-split">
      <div>
        <p className="eyebrow">ILLUSTRATIVE REPORT / CC-001</p>
        <h4>Follow a report to resolution.</h4>
        <label>
          Sample location
          <select
            value={report}
            onChange={(e) => {
              setReport(e.target.value);
              setStep(0);
            }}
          >
            <option>Riverside</option>
            <option>Park entrance</option>
          </select>
        </label>
        <div
          className="sample-scene"
          aria-label="Illustration of waste at a sample location"
        >
          <svg
            viewBox="0 0 500 180"
            role="img"
            aria-label="Conceptual landscape and discarded containers"
          >
            <path
              d="M0 100Q120 30 250 100T500 100V180H0Z"
              fill="currentColor"
              opacity=".13"
            />
            <path
              d="M0 150Q220 90 500 160"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <g fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M190 80h28l-3 46h-22zM196 70h17v10M260 100h30v27h-30z" />
            </g>
          </svg>
          <small>Vector illustration · no classifier runs here</small>
        </div>
        <div className="demo-readout" role="status">
          <strong>{reportStages[step]}</strong>
          <p>
            {report} · synthetic report. Example label: mixed waste;
            administrator review required.
          </p>
        </div>
      </div>
      <div>
        <ol className="stage-list">
          {reportStages.map((s, i) => (
            <li key={s}>
              <button
                aria-current={step === i ? "step" : undefined}
                onClick={() => {
                  setStep(i);
                  playSound("select");
                }}
              >
                <span>0{i + 1}</span>
                <strong>{s}</strong>
              </button>
            </li>
          ))}
        </ol>
        <p className="demo-note">
          The application supports photo capture, GPS-linked reports, review,
          assignment, status and cleanup evidence. This preview changes local
          sample state only; it uploads nothing and does not simulate detection
          accuracy.
        </p>
        <button onClick={() => setStep(0)}>Reset report</button>
      </div>
    </div>
  );
}
const students = [
  {
    id: "DEMO-01",
    name: "Sample Student A",
    course: "Computer Engineering",
    year: "Year 1",
  },
  {
    id: "DEMO-02",
    name: "Sample Student B",
    course: "Civil Engineering",
    year: "Year 2",
  },
  {
    id: "DEMO-03",
    name: "Sample Student C",
    course: "Computer Engineering",
    year: "Year 3",
  },
];
function Students() {
  const [query, setQuery] = useState(""),
    [course, setCourse] = useState("All"),
    [selected, setSelected] = useState("DEMO-01");
  const filtered = students.filter(
    (s) =>
      (course === "All" || s.course === course) &&
      `${s.name} ${s.id}`.toLowerCase().includes(query.toLowerCase()),
  );
  const student = students.find((s) => s.id === selected)!;
  return (
    <div className="demo-split">
      <div>
        <p className="eyebrow">SAMPLE CAMPUS DIRECTORY</p>
        <h4>Find a student. Inspect a record.</h4>
        <label>
          Search sample students
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or student ID"
          />
        </label>
        <label>
          Course filter
          <select value={course} onChange={(e) => setCourse(e.target.value)}>
            <option>All</option>
            <option>Computer Engineering</option>
            <option>Civil Engineering</option>
          </select>
        </label>
        <p role="status">{filtered.length} matching sample records</p>
        <ul className="record-list">
          {filtered.map((s) => (
            <li key={s.id}>
              <button
                aria-pressed={selected === s.id}
                onClick={() => {
                  setSelected(s.id);
                  playSound("select");
                }}
              >
                <strong>{s.name}</strong>
                <small>
                  {s.id} · {s.course}
                </small>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="sample-id">
        <span>SMART UNIVERSITY / SAMPLE ID</span>
        <div className="sample-avatar" aria-hidden="true">
          S
        </div>
        <h4>{student.name}</h4>
        <p>{student.id}</p>
        <p>
          {student.course} · {student.year}
        </p>
        <hr />
        <small>
          Fictional records. Directory, courses and student ID presentation
          reflect documented project areas. No personal student data or
          attendance claims.
        </small>
      </div>
    </div>
  );
}
const destinations = [
  {
    name: "Narayani riverfront",
    category: "Nature",
    x: 28,
    y: 40,
    description: "A sample riverside stop in a local exploration itinerary.",
  },
  {
    name: "Bishazari Tal",
    category: "Nature",
    x: 67,
    y: 65,
    description: "A sample wetland destination for a nature-focused itinerary.",
  },
  {
    name: "Devghat",
    category: "Culture",
    x: 52,
    y: 20,
    description: "A sample cultural destination at the river confluence.",
  },
];
function Travel() {
  const [category, setCategory] = useState("All"),
    [selected, setSelected] = useState(0);
  return (
    <div className="demo-split">
      <div>
        <p className="eyebrow">ILLUSTRATIVE TRAVEL EXPLORER</p>
        <h4>A route around your interests.</h4>
        <label>
          Destination category
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSelected(e.target.value === "Culture" ? 2 : 0);
            }}
          >
            <option>All</option>
            <option>Nature</option>
            <option>Culture</option>
          </select>
        </label>
        <div
          className="travel-map"
          role="group"
          aria-label="Schematic destination map, not geographic navigation"
        >
          <svg viewBox="0 0 400 260" aria-hidden="true">
            <path
              d="M40 0Q250 70 100 150T250 260"
              fill="none"
              stroke="currentColor"
              opacity=".2"
              strokeWidth="26"
            />
            <path
              d="M112 104L208 52L268 169"
              fill="none"
              stroke="currentColor"
              strokeDasharray="5 6"
            />
          </svg>
          {destinations.map(
            (d, i) =>
              (category === "All" || category === d.category) && (
                <button
                  key={d.name}
                  style={{ left: `${d.x}%`, top: `${d.y}%` }}
                  aria-label={`Explore ${d.name}`}
                  aria-pressed={selected === i}
                  onClick={() => {
                    setSelected(i);
                    playSound("select");
                  }}
                >
                  {i + 1}
                </button>
              ),
          )}
        </div>
        <small>Schematic positions, not map coordinates.</small>
      </div>
      <div className="demo-readout" role="status">
        <p className="eyebrow">
          {destinations[selected].category} / SELECTED STOP
        </p>
        <h4>{destinations[selected].name}</h4>
        <p>{destinations[selected].description}</p>
        <p className="demo-note">
          A local UI illustration of destination exploration. The project
          documents interest, budget and time-based itineraries, maps and
          replacement previews. This demonstration has no live routing, bookings
          or Gemini connection.
        </p>
      </div>
    </div>
  );
}
function Club() {
  const [mobile, setMobile] = useState(false);
  return (
    <div>
      <div className="demo-controls">
        <button
          aria-pressed={!mobile}
          onClick={() => {
            setMobile(false);
            playSound("select");
          }}
        >
          Desktop capture
        </button>
        <button
          aria-pressed={mobile}
          onClick={() => {
            setMobile(true);
            playSound("select");
          }}
        >
          Mobile capture
        </button>
        <a
          href="https://www.unitedtechclub.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit live website ↗
        </a>
      </div>
      <figure className={`club-frame ${mobile ? "mobile" : ""}`}>
        <div className="demo-topline">
          <span>● ● ●</span>
          <span>unitedtechclub.com</span>
        </div>
        <img
          src={`assets/screenshots/club-${mobile ? "mobile" : "desktop"}.webp`}
          width={mobile ? 375 : 1440}
          height={mobile ? 812 : 900}
          loading="lazy"
          alt={`Real ${mobile ? "375px mobile" : "1440px desktop"} United Tech Club homepage captured November 2026`}
        />
        <figcaption>
          Actual website capture · November 2026 · not an embedded live page
        </figcaption>
      </figure>
      <div className="demo-controls">
        <a
          href="https://www.unitedtechclub.com/events"
          target="_blank"
          rel="noopener noreferrer"
        >
          Events ↗
        </a>
        <a
          href="https://www.unitedtechclub.com/gallery"
          target="_blank"
          rel="noopener noreferrer"
        >
          Gallery ↗
        </a>
        <a
          href="https://www.unitedtechclub.com/committee"
          target="_blank"
          rel="noopener noreferrer"
        >
          Committee ↗
        </a>
      </div>
      <p className="demo-note">
        Public navigation and announcement registration link verified. No
        registration submitted. Personal development contribution is
        unconfirmed; the live site credits Er. Soviyat Lamsal and Bipson Paudel.
      </p>
    </div>
  );
}
export default function Previews({ id }: { id: string }) {
  return id === "chitwan-care" ? (
    <Care />
  ) : id === "smart-university" ? (
    <Students />
  ) : id === "chitwan-plus" ? (
    <Travel />
  ) : (
    <Club />
  );
}
