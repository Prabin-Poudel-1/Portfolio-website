import { useState } from "react";
import { evidenceCell, evidenceLabels } from "./model";
import { playSound } from "../utils/sound.js";
export default function Geospatial() {
  const [split, setSplit] = useState(50),
    [layer, setLayer] = useState(true),
    [cell, setCell] = useState(23);
  const row = Math.floor(cell / 12),
    col = cell % 12,
    after = (col / 12) * 100 >= split;
  return (
    <div className="demo-split geo-demo">
      <div>
        <div className="demo-topline">
          <span>03 / EVIDENCE EXPLORER</span>
          <span>SYNTHETIC GRID</span>
        </div>
        <div
          className="geo-grid"
          role="group"
          aria-label="Synthetic evidence cells. Select a cell to inspect it."
        >
          {Array.from({ length: 96 }, (_, i) => {
            const r = Math.floor(i / 12),
              c = i % 12;
            return (
              <button
                key={i}
                tabIndex={cell === i ? 0 : -1}
                onKeyDown={(e) => {
                  const delta = (
                    {
                      ArrowRight: 1,
                      ArrowLeft: -1,
                      ArrowDown: 12,
                      ArrowUp: -12,
                    } as Record<string, number>
                  )[e.key];
                  if (delta) {
                    e.preventDefault();
                    const next = Math.max(0, Math.min(95, i + delta));
                    setCell(next);
                    (
                      e.currentTarget.parentElement?.children[
                        next
                      ] as HTMLButtonElement
                    )?.focus();
                  }
                }}
                aria-label={`Row ${r + 1}, column ${c + 1}: ${evidenceLabels[evidenceCell(r, c, (c / 12) * 100 >= split)]}`}
                aria-pressed={cell === i}
                className={`cell code-${layer ? evidenceCell(r, c, (c / 12) * 100 >= split) : 0}`}
                onClick={() => {
                  setCell(i);
                  playSound("select");
                }}
              />
            );
          })}
          <div
            className="geo-divider"
            style={{ left: `${split}%` }}
            aria-hidden="true"
          />
        </div>
        <label className="demo-range">
          Comparison boundary · {split}%
          <input
            aria-label="Before after comparison boundary"
            type="range"
            min="0"
            max="100"
            value={split}
            onChange={(e) => setSplit(Number(e.target.value))}
          />
        </label>
        <div className="demo-topline">
          <span>SCENARIO A</span>
          <span>SCENARIO B</span>
        </div>
        <label className="demo-check">
          <input
            type="checkbox"
            checked={layer}
            onChange={(e) => setLayer(e.target.checked)}
          />{" "}
          Show categorical evidence layer
        </label>
      </div>
      <div>
        <p className="eyebrow">Interpret evidence, not predictions</p>
        <h4>Every cell needs context.</h4>
        <p>
          This interactive grid illustrates Rakshak’s categorical evidence
          inspection. It contains no satellite imagery or measurements.
        </p>
        <div className="demo-readout" role="status">
          <strong>{evidenceLabels[evidenceCell(row, col, after)]}</strong>
          <p>
            Local grid R{row + 1} / C{col + 1} · Scenario {after ? "B" : "A"}
          </p>
          <small>
            Geographic coordinates: not assigned. Review status: illustrative
            only. Source: deterministic synthetic pattern.
          </small>
        </div>
        <div className="demo-controls">
          <label>
            Inspect row
            <select
              value={row}
              onChange={(e) => setCell(Number(e.target.value) * 12 + col)}
            >
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i} value={i}>
                  {i + 1}
                </option>
              ))}
            </select>
          </label>
          <label>
            Inspect column
            <select
              value={col}
              onChange={(e) => setCell(row * 12 + Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {i + 1}
                </option>
              ))}
            </select>
          </label>
        </div>
        <ul className="geo-legend">
          {evidenceLabels.map((v, i) => (
            <li key={v}>
              <i className={`code-${i}`} />
              {v}
            </li>
          ))}
        </ul>
        <p className="demo-note">
          The project documents reviewed GeoTIFF evidence, provenance,
          authenticated tiles and native-grid queries. Unresolved source QA
          remains. Supporting evidence does not establish flooding, landslides
          or damage. No NISAR observations or live feeds are shown.
        </p>
      </div>
    </div>
  );
}
