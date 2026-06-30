"use client";

import type { MouseEvent, ReactNode } from "react";

interface LoginSpotlightProps {
  children: ReactNode;
}

export function LoginSpotlight({ children }: LoginSpotlightProps) {
  function updateSpotlight(event: MouseEvent<HTMLElement>) {
    const surface = event.currentTarget;
    surface.style.setProperty("--spotlight-x", `${event.pageX}px`);
    surface.style.setProperty("--spotlight-y", `${event.pageY}px`);
    surface.dataset.pointer = "active";
  }

  function resetSpotlight(event: MouseEvent<HTMLElement>) {
    event.currentTarget.dataset.pointer = "idle";
  }

  return (
    <main
      className="login-spotlight relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-8"
      data-pointer="idle"
      onMouseMove={updateSpotlight}
      onMouseLeave={resetSpotlight}
    >
      {children}
    </main>
  );
}
