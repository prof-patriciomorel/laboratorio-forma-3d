"use client";

import { Copy, Redo2, RotateCcw, Trash2, Undo2 } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";

export function TopBar() {
  const projectName = useEditorStore((state) => state.projectName);
  const setProjectName = useEditorStore((state) => state.setProjectName);
  const newProject = useEditorStore((state) => state.newProject);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const past = useEditorStore((state) => state.past);
  const future = useEditorStore((state) => state.future);
  const selectedIds = useEditorStore((state) => state.selectedIds);
  const duplicateSelected = useEditorStore((state) => state.duplicateSelected);
  const deleteSelected = useEditorStore((state) => state.deleteSelected);

  return (
    <header className="top-bar glass-panel">
      <div className="brand-lockup">
        <div className="brand-mark">M</div>
        <div>
          <strong>MORFO LAB</strong>
          <span>canvas espacial</span>
        </div>
      </div>
      <input
        className="project-name"
        value={projectName}
        onChange={(event) => setProjectName(event.target.value)}
        aria-label="Nombre del proyecto"
      />
      <div className="top-actions">
        <button className="icon-button" type="button" onClick={newProject} title="Nuevo proyecto"><RotateCcw size={17} /></button>
        <span className="toolbar-divider" />
        <button className="icon-button" type="button" onClick={undo} disabled={!past.length} title="Deshacer"><Undo2 size={17} /></button>
        <button className="icon-button" type="button" onClick={redo} disabled={!future.length} title="Rehacer"><Redo2 size={17} /></button>
        <span className="toolbar-divider" />
        <button className="icon-button" type="button" onClick={duplicateSelected} disabled={!selectedIds.length} title="Duplicar"><Copy size={17} /></button>
        <button className="icon-button danger" type="button" onClick={deleteSelected} disabled={!selectedIds.length} title="Eliminar"><Trash2 size={17} /></button>
        <div className="saved-pill">✓ Guardado local</div>
      </div>
    </header>
  );
}
