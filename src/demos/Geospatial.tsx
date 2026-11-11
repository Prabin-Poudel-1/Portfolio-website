import { useState } from "react";
import {
  evidenceCell,
  evidenceLabels,
  syntheticSignal,
  qualityMasked,
} from "./model";
import { playSound } from "../utils/sound.js";
export default function Geospatial() {
  const [split, setSplit] = useState(50),
    [layer, setLayer] = useState(true),
    [mode, setMode] = useState("evidence"),
    [mask, setMask] = useState(true),
    [cell, setCell] = useState(23);
  const row = Math.floor(cell / 12),
    col = cell % 12,
    after = ((col + 0.5) / 12) * 100 >= split;
  const beforeValue = syntheticSignal(row, col, false),
    afterValue = syntheticSignal(row, col, true);
  const excluded = mask && qualityMasked(row, col);
  return (
    <div className="demo-split geo-demo">
      <div>
        <div className="demo-topline">
          <span>03 / EVIDENCE EXPLORER</span>
          <span>SYNTHETIC GRID</span>
        </div>
        <div className="geo-metadata">
          <span>Before / synthetic A</span>
          <span>After / synthetic B</span>
          <small>
            No acquisition dates, sensor or geographic coordinates assigned.
          </small>
        </div>
        <label>
          Inspection layer
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="evidence">Categorical evidence</option>
            <option value="signal">Synthetic surface signal</option>
            <option value="change">Synthetic signal difference</option>
          </select>
        </label>
        <div
          className={`geo-grid mode-${mode}`}
          role="group"
          aria-label="Synthetic evidence cells. Select a cell to inspect it."
        >
          {Array.from({ length: 96 }, (_, i) => {
            const r = Math.floor(i / 12),
              c = i % 12;
            const isAfter = ((c + 0.5) / 12) * 100 >= split;
            const masked = mask && qualityMasked(r, c);
            const delta =
              syntheticSignal(r, c, true) - syntheticSignal(r, c, false);
            const label = masked
              ? "Quality masked; do not interpret"
              : mode === "evidence"
                ? evidenceLabels[evidenceCell(r, c, isAfter)]
                : mode === "signal"
                  ? `Synthetic intensity ${syntheticSignal(r, c, isAfter)}`
                  : `Synthetic change ${delta}`;
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
                aria-label={`Row ${r + 1}, column ${c + 1}: ${label}`}
                aria-pressed={cell === i}
                className={`cell ${mode === "evidence" ? `code-${layer ? evidenceCell(r, c, isAfter) : 0}` : ""} ${masked ? "quality-masked" : ""}`}
                style={
                  mode === "signal" && !masked
                    ? {
                        background: `hsl(245 14% ${20 + syntheticSignal(r, c, isAfter) * 0.55}%)`,
                      }
                    : mode === "change" && !masked
                      ? {
                          background:
                            delta > 0
                              ? "#b6aef3"
                              : delta < 0
                                ? "#627582"
                                : "#333743",
                        }
                      : undefined
                }
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
          <span>BEFORE / SYNTHETIC A</span>
          <span>AFTER / SYNTHETIC B</span>
        </div>
        <label className="demo-check">
          <input
            type="checkbox"
            disabled={mode !== "evidence"}
            checked={layer}
            onChange={(e) => setLayer(e.target.checked)}
          />{" "}
          Show categorical evidence layer
        </label>
        <label className="demo-check">
          <input
            type="checkbox"
            checked={mask}
            onChange={(e) => setMask(e.target.checked)}
          />
          Apply illustrative quality mask
        </label>
        <p className="demo-note">
          {mode === "change"
            ? "Lavender: increase · slate: decrease · graphite: unchanged. Illustrative units, not radar dB."
            : mode === "signal"
              ? "Lighter cells indicate a larger synthetic value. This is not satellite imagery."
              : "Evidence colors describe categories, not confidence scores."}{" "}
          Diagonal hatching marks excluded cells.
        </p>
      </div>
      <div>
        <p className="eyebrow">Interpret evidence, not predictions</p>
        <h4>Every cell needs context.</h4>
        <p>
          This interactive grid illustrates Rakshak’s categorical evidence
          inspection. It contains no satellite imagery or measurements.
        </p>
        <div className="demo-readout" role="status">
          <strong>
            {excluded
              ? "Quality masked · interpretation withheld"
              : mode === "signal"
                ? `Synthetic surface value: ${after ? afterValue : beforeValue}`
                : mode === "change"
                  ? `Synthetic difference: ${afterValue - beforeValue > 0 ? "+" : ""}${afterValue - beforeValue}`
                  : evidenceLabels[evidenceCell(row, col, after)]}
          </strong>
          <p>
            Local grid R{row + 1} / C{col + 1} · Scenario {after ? "B" : "A"}
          </p>
          <small>
            Geographic coordinates: not assigned. Review status: illustrative
            only. Source: deterministic synthetic pattern.
          </small>
        </div>
        <dl className="evidence-comparison">
          <div>
            <dt>Before (synthetic)</dt>
            <dd>{beforeValue}</dd>
          </div>
          <div>
            <dt>After (synthetic)</dt>
            <dd>{afterValue}</dd>
          </div>
          <div>
            <dt>Difference</dt>
            <dd>
              {excluded
                ? "Excluded"
                : `${afterValue - beforeValue > 0 ? "+" : ""}${afterValue - beforeValue}`}
            </dd>
          </div>
        </dl>
        <p className="demo-note">
          <strong>Observation:</strong> this selected cell changes between two
          generated arrays. <strong>Interpretation:</strong> that change alone
          cannot establish a flood or damage.{" "}
          {excluded
            ? "This cell is excluded by an illustrative QA rule."
            : "Real interpretation needs acquisition provenance, calibration, quality screening and corroborating evidence."}
        </p>
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
        {mode === "evidence" && (
          <ul className="geo-legend">
            {evidenceLabels.map((v, i) => (
              <li key={v}>
                <i className={`code-${i}`} />
                {v}
              </li>
            ))}
          </ul>
        )}
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
