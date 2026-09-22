"use client";

import { Box, Grid3X3, Move3D, Rotate3D, Scaling, View } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { CameraView, TransformMode } from "@/types/morfo";

const MODES: { value: TransformMode; label: string; icon: typeof Move3D }[] = [
  { value: "translate", label: "Mover", icon: Move3D },
  { value: "rotate", label: "Rotar", icon: Rotate3D },
  { value: "scale", label: "Escalar", icon: Scaling },
];

const VIEWS: { value: CameraView; label: string }[] = [
  { value: "iso", label: "Iso" },
  { value: "front", label: "Frente" },
  { value: "right", label: "Lado" },
  { value: "top", label: "Arriba" },
  { value: "perspective", label: "Persp." },
];

export function ViewControls() {
  const transformMode = useEditorStore((state) => state.transformMode);
  const setTransformMode = useEditorStore((state) => state.setTransformMode);
  const requestCameraView = useEditorStore((state) => state.requestCameraView);
  const showGrid = useEditorStore((state) => state.showGrid);
  const showAxes = useEditorStore((state) => state.showAxes);
  const setShowGrid = useEditorStore((state) => state.setShowGrid);
  const setShowAxes = useEditorStore((state) => state.setShowAxes);

  return (
    <div className="view-controls glass-panel">
      <div className="control-group">
        {MODES.map(({ value, label, icon: Icon }) => (
          <button key={value} className={`compact-button ${transformMode === value ? "active" : ""}`} type="button" onClick={() => setTransformMode(value)}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
      <span className="toolbar-divider" />
      <div className="control-group view-list">
        <View size={15} />
        {VIEWS.map((view) => (
          <button key={view.value} className="text-button" type="button" onClick={() => requestCameraView(view.value)}>{view.label}</button>
        ))}
      </div>
      <span className="toolbar-divider" />
      <button className={`compact-button ${showGrid ? "active" : ""}`} type="button" onClick={() => setShowGrid(!showGrid)}><Grid3X3 size={15} /> Grilla</button>
      <button className={`compact-button ${showAxes ? "active" : ""}`} type="button" onClick={() => setShowAxes(!showAxes)}><Box size={15} /> Ejes</button>
    </div>
  );
}
