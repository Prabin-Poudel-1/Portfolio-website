import React, { useEffect, useState } from "react";
import {
  restoreSound,
  setSound,
  playSound,
  pauseSound,
  setVolume,
  soundVolume,
} from "../utils/sound.js";
export function SoundToggle() {
  const [enabled, setEnabled] = useState(false);
  const [level, setLevel] = useState(55);
  useEffect(() => {
    setEnabled(restoreSound());
    setLevel(Math.round(soundVolume() * 100));
    const hidden = () => {
      if (document.hidden) pauseSound();
    };
    document.addEventListener("visibilitychange", hidden);
    return () => document.removeEventListener("visibilitychange", hidden);
  }, []);
  return (
    <div className="sound-control">
      <button
        className="sound-toggle"
        type="button"
        aria-pressed={enabled}
        aria-label={enabled ? "Disable sound effects" : "Enable sound effects"}
        onClick={() => {
          const next = setSound(!enabled);
          setEnabled(next);
          if (next) playSound("success");
        }}
      >
        <span aria-hidden="true">{enabled ? "♪" : "♩"}</span>
        <span> Sound {enabled ? "on" : "off"}</span>
      </button>
      {enabled && (
        <details
          className="sound-settings"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.currentTarget.open = false;
              e.currentTarget.querySelector("summary")?.focus();
            }
          }}
        >
          <summary aria-label="Adjust sound volume">···</summary>
          <div className="sound-popover">
            <label htmlFor="sound-volume">
              Sound level <output>{level}%</output>
            </label>
            <input
              id="sound-volume"
              type="range"
              min="0"
              max="100"
              step="5"
              value={level}
              onChange={(e) => {
                const value = Number(e.target.value);
                setLevel(value);
                setVolume(value / 100);
              }}
            />
            <button type="button" onClick={() => playSound("project")}>
              Preview sound
            </button>
            <small>Quiet by design. No background audio.</small>
          </div>
        </details>
      )}
    </div>
  );
}
