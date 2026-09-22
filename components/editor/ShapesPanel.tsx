"use client";

import { Circle, Diamond, Hexagon, Minus, MousePointer2, Pentagon, Square, Star, Triangle } from "lucide-react";
import type { ComponentType } from "react";
import { useEditorStore } from "@/store/editorStore";
import { MorfoObjectKind } from "@/types/morfo";

const SHAPES: { kind: MorfoObjectKind; label: string; Icon: ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { kind: "circle", label: "Círculo", Icon: Circle },
  { kind: "square", label: "Cuadrado", Icon: Square },
  { kind: "triangle", label: "Triángulo", Icon: Triangle },
  { kind: "hexagon", label: "Hexágono", Icon: Hexagon },
  { kind: "star", label: "Estrella", Icon: Star },
  { kind: "point", label: "Punto", Icon: Diamond },
  { kind: "line", label: "Línea", Icon: Minus },
  { kind: "plane", label: "Plano", Icon: Pentagon },
];

export function ShapesPanel() {
  const addObject = useEditorStore((state) => state.addObject);

  return (
    <aside className="glass-panel shapes-panel">
      <div className="panel-heading">
        <span>FORMAS</span>
        <MousePointer2 size={15} />
      </div>
      <p className="panel-hint">Arrastrá o hacé click para agregar.</p>
      <div className="shape-grid">
        {SHAPES.map(({ kind, label, Icon }) => (
          <button
            key={kind}
            className="shape-button"
            type="button"
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData("application/x-morfo-shape", kind);
              event.dataTransfer.effectAllowed = "copy";
            }}
            onClick={() => addObject(kind)}
            title={label}
          >
            <Icon size={23} strokeWidth={1.7} />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div className="tool-note">
        <strong>Próximo:</strong>
        <span>Dibujo libre + importar SVG</span>
      </div>
    </aside>
  );
}
