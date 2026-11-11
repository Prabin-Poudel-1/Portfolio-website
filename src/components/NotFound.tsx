import React, { useState } from "react";
import { playSound } from "../utils/sound.js";
export function NotFound() {
  const [connected, setConnected] = useState(false);
  return (
    <section className="section-wrap lost-route">
      <p className="eyebrow">404 / Packet destination unknown</p>
      <div
        className={"lost-network " + (connected ? "connected" : "")}
        aria-hidden="true"
      >
        <span>YOU</span>
        <i />
        <span>?</span>
        <i />
        <span>HOME</span>
      </div>
      <h1>{connected ? "Connection restored." : "This route went offline."}</h1>
      <p>
        {connected
          ? "Your next destination is ready."
          : "The page may have moved. The rest of the network is still here."}
      </p>
      <button
        className="button"
        onClick={() => {
          setConnected(!connected);
          playSound("secret");
        }}
      >
        {connected ? "Reset connection" : "Reconnect the nodes"}
      </button>
      <a className="button primary" href="/">
        Return home ↗
      </a>
    </section>
  );
}
