import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { SignalJourney } from "./components/SignalJourney";
import { Header } from "./components/Header";
import { NotFound } from "./components/NotFound";
import { InteractionEffects } from "./components/InteractionEffects";
import { Footer } from "./components/Footer";
import { Hero } from "./sections/Hero";
import { Projects } from "./sections/Projects";
import { Expertise } from "./sections/Expertise";
import { Skills } from "./sections/Skills";
import { About } from "./sections/About";
import { Contact } from "./sections/Contact";
import { mountContact } from "./utils/contact.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
function Home() {
  useEffect(() => {
    const cleanup = mountContact();
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".home-content > *", {
        y: 18,
        opacity: 0,
        duration: 0.5,
        stagger: 0.055,
        clearProps: "all",
      });
      gsap.utils
        .toArray<HTMLElement>(".expertise-card,.section-heading")
        .forEach((el) =>
          gsap.from(el, {
            y: 24,
            opacity: 0,
            duration: 0.45,
            clearProps: "all",
            scrollTrigger: { trigger: el, start: "top 95%", once: true },
          }),
        );
    });
    return () => {
      cleanup?.();
      media.revert();
    };
  }, []);
  return (
    <>
      <Hero />
      <Projects />
      <SignalJourney>
        <Skills />
        <Expertise />
        <About />
        <Contact />
      </SignalJourney>
    </>
  );
}
export function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <InteractionEffects />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/index.html" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
