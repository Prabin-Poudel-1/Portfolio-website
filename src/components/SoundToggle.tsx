import React, { useEffect, useState } from "react";
import {
  restoreSound,
  setSound,
  playSound,
  pauseSound,
} from "../utils/sound.js";
export function SoundToggle() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    setEnabled(restoreSound());
    const hidden = () => {
      if (document.hidden) pauseSound();
    };
    document.addEventListener("visibilitychange", hidden);
    return () => document.removeEventListener("visibilitychange", hidden);
  }, []);
  return (
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
  );
}
