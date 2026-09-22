"use client";

import { useEffect } from "react";
import { SpatialCanvas } from "@/components/canvas/SpatialCanvas";
import { LayersPanel } from "@/components/editor/LayersPanel";
import { ShapesPanel } from "@/components/editor/ShapesPanel";
import { TopBar } from "@/components/editor/TopBar";
import { ViewControls } from "@/components/editor/ViewControls";
import { useEditorStore } from "@/store/editorStore";

export default function Home() {
  const hydrate = useEditorStore((state) => state.hydrate);
  const hydrated = useEditorStore((state) => state.hydrated);
  const deleteSelected = useEditorStore((state) => state.deleteSelected);
  const duplicateSelected = useEditorStore((state) => state.duplicateSelected);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if (isEditing) return;

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelected();
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateSelected();
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteSelected, duplicateSelected, redo, undo]);

  if (!hydrated) {
    return <main className="loading-screen">Preparando Morfo Lab…</main>;
  }

  return (
    <main className="app-shell">
      <TopBar />
      <div className="workspace">
        <ShapesPanel />
        <section className="canvas-column">
          <SpatialCanvas />
          <ViewControls />
        </section>
        <LayersPanel />
      </div>
    </main>
  );
}
