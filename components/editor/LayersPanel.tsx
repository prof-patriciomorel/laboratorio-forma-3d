"use client";

import { Eye, EyeOff, Lock, LockOpen, SlidersHorizontal } from "lucide-react";
import { useMemo } from "react";
import { useEditorStore } from "@/store/editorStore";
import { Vec3 } from "@/types/morfo";

const toDegrees = (value: number) => Math.round((value * 180) / Math.PI * 10) / 10;
const toRadians = (value: number) => (value * Math.PI) / 180;

function VectorEditor({ label, value, onChange, degrees = false }: { label: string; value: Vec3; onChange: (next: Vec3) => void; degrees?: boolean }) {
  return (
    <div className="vector-row">
      <span>{label}</span>
      {([0, 1, 2] as const).map((index) => (
        <label key={index} className="axis-input">
          <small>{["X", "Y", "Z"][index]}</small>
          <input
            type="number"
            step={degrees ? 1 : 0.1}
            value={degrees ? toDegrees(value[index]) : Math.round(value[index] * 100) / 100}
            onChange={(event) => {
              const next = [...value] as Vec3;
              const parsed = Number(event.target.value);
              next[index] = degrees ? toRadians(parsed) : parsed;
              onChange(next);
            }}
          />
        </label>
      ))}
    </div>
  );
}

export function LayersPanel() {
  const objects = useEditorStore((state) => state.objects);
  const selectedIds = useEditorStore((state) => state.selectedIds);
  const selectObject = useEditorStore((state) => state.selectObject);
  const toggleVisible = useEditorStore((state) => state.toggleVisible);
  const toggleLocked = useEditorStore((state) => state.toggleLocked);
  const updateObject = useEditorStore((state) => state.updateObject);
  const background = useEditorStore((state) => state.background);
  const setBackground = useEditorStore((state) => state.setBackground);

  const selected = useMemo(() => objects.find((object) => object.id === selectedIds[0]), [objects, selectedIds]);

  return (
    <aside className="glass-panel layers-panel">
      <div className="panel-heading"><span>OBJETOS</span><span className="count-pill">{objects.length}</span></div>
      <div className="layers-list">
        {!objects.length && <div className="empty-state">Agregá una forma para comenzar.</div>}
        {[...objects].reverse().map((object) => (
          <button
            type="button"
            key={object.id}
            className={`layer-row ${selectedIds.includes(object.id) ? "selected" : ""}`}
            onClick={(event) => selectObject(object.id, event.shiftKey)}
          >
            <span className="layer-swatch" style={{ background: object.color }} />
            <span className="layer-name">{object.name}</span>
            <span className="layer-actions">
              <span role="button" tabIndex={0} title="Mostrar/Ocultar" onClick={(event) => { event.stopPropagation(); toggleVisible(object.id); }}>{object.visible ? <Eye size={14} /> : <EyeOff size={14} />}</span>
              <span role="button" tabIndex={0} title="Bloquear" onClick={(event) => { event.stopPropagation(); toggleLocked(object.id); }}>{object.locked ? <Lock size={14} /> : <LockOpen size={14} />}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="properties-header"><SlidersHorizontal size={15} /> PROPIEDADES</div>
      {selected ? (
        <div className="properties-panel">
          <label className="field-label">Nombre<input value={selected.name} onChange={(event) => updateObject(selected.id, { name: event.target.value })} /></label>
          <div className="color-row">
            <label className="field-label">Color<input type="color" value={selected.color} onChange={(event) => updateObject(selected.id, { color: event.target.value }, true)} /></label>
            <label className="field-label grow">HEX<input value={selected.color.toUpperCase()} onChange={(event) => updateObject(selected.id, { color: event.target.value })} /></label>
          </div>
          <label className="field-label">Opacidad
            <div className="slider-row"><input type="range" min="0.1" max="1" step="0.05" value={selected.opacity} onChange={(event) => updateObject(selected.id, { opacity: Number(event.target.value) })} /><span>{Math.round(selected.opacity * 100)}%</span></div>
          </label>
          <VectorEditor label="Posición" value={selected.position} onChange={(position) => updateObject(selected.id, { position })} />
          <VectorEditor label="Rotación" value={selected.rotation} degrees onChange={(rotation) => updateObject(selected.id, { rotation })} />
          <VectorEditor label="Escala" value={selected.scale} onChange={(scale) => updateObject(selected.id, { scale })} />
        </div>
      ) : (
        <div className="empty-state compact">Seleccioná un objeto para editar sus propiedades.</div>
      )}
      <div className="canvas-settings">
        <span>FONDO</span>
        <input type="color" value={background} onChange={(event) => setBackground(event.target.value)} />
      </div>
    </aside>
  );
}
