"use client";

import { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import { DomEvent } from "leaflet";
import { Maximize, Minimize, Plus, Minus } from "lucide-react";

export function MapControls() {
  const map = useMap();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rootRef.current) {
      DomEvent.disableClickPropagation(rootRef.current);
    }
  }, []);

  useEffect(() => {
    const container = map.getContainer();

    const onFullscreenChange = () => {
      const active = document.fullscreenElement === container;
      setIsFullscreen(active);
      setTimeout(() => map.invalidateSize(), 120);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [map]);

  const toggleFullscreen = () => {
    const container = map.getContainer();
    if (document.fullscreenElement === container) {
      void document.exitFullscreen();
    } else {
      void container.requestFullscreen();
    }
  };

  const buttonClass =
    "flex h-8 w-8 items-center justify-center rounded-md bg-background text-foreground shadow-md ring-1 ring-border transition-colors hover:bg-muted";

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 z-[1100]">
      <div className="pointer-events-auto absolute right-2 top-2 flex flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={() => map.zoomIn()}
          aria-label="Zoom in"
          title="Zoom in"
          className={buttonClass}
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => map.zoomOut()}
          aria-label="Zoom out"
          title="Zoom out"
          className={buttonClass}
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          className={buttonClass}
        >
          {isFullscreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
