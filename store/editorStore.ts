"use client";

import { create } from "zustand";
import { CameraView, MorfoObject, MorfoObjectKind, SceneSnapshot, TransformMode, Vec3 } from "@/types/morfo";

const STORAGE_KEY = "morfo-lab-v1";
const HISTORY_LIMIT = 80;

const cloneObjects = (objects: MorfoObject[]) => objects.map((object) => ({ ...object, position: [...object.position] as Vec3, rotation: [...object.rotation] as Vec3, scale: [...object.scale] as Vec3 }));
const snapshot = (objects: MorfoObject[], selectedIds: string[]): SceneSnapshot => ({ objects: cloneObjects(objects), selectedIds: [...selectedIds] });

const KIND_LABELS: Record<MorfoObjectKind, string> = {
  circle: "Círculo",
  square: "Cuadrado",
  triangle: "Triángulo",
  hexagon: "Hexágono",
  star: "Estrella",
  point: "Punto",
  line: "Línea",
  plane: "Plano",
};

const defaultObject = (kind: MorfoObjectKind, position: Vec3): MorfoObject => ({
  id: crypto.randomUUID(),
  name: KIND_LABELS[kind],
  kind,
  position,
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  color: "#8b5cf6",
  opacity: 1,
  visible: true,
  locked: false,
});

type PersistedState = {
  objects: MorfoObject[];
  projectName: string;
  showGrid: boolean;
  showAxes: boolean;
  background: string;
};

type EditorState = {
  objects: MorfoObject[];
  selectedIds: string[];
  transformMode: TransformMode;
  showGrid: boolean;
  showAxes: boolean;
  background: string;
  cameraView: CameraView;
  cameraRequestId: number;
  projectName: string;
  past: SceneSnapshot[];
  future: SceneSnapshot[];
  hydrated: boolean;
  hydrate: () => void;
  checkpoint: () => void;
  undo: () => void;
  redo: () => void;
  addObject: (kind: MorfoObjectKind, position?: Vec3) => void;
  updateObject: (id: string, patch: Partial<MorfoObject>, recordHistory?: boolean) => void;
  renameObject: (id: string, name: string) => void;
  selectObject: (id: string, additive?: boolean) => void;
  clearSelection: () => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  toggleVisible: (id: string) => void;
  toggleLocked: (id: string) => void;
  setTransformMode: (mode: TransformMode) => void;
  setShowGrid: (value: boolean) => void;
  setShowAxes: (value: boolean) => void;
  setBackground: (value: string) => void;
  requestCameraView: (view: CameraView) => void;
  setProjectName: (name: string) => void;
  newProject: () => void;
  persist: () => void;
};

export const useEditorStore = create<EditorState>((set, get) => ({
  objects: [], selectedIds: [], transformMode: "translate", showGrid: true, showAxes: true,
  background: "#f4f4f2", cameraView: "iso", cameraRequestId: 0, projectName: "Proyecto sin título",
  past: [], future: [], hydrated: false,

  hydrate: () => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) { set({ hydrated: true }); return; }
      const saved = JSON.parse(raw) as PersistedState;
      set({
        objects: Array.isArray(saved.objects) ? saved.objects : [],
        projectName: saved.projectName || "Proyecto sin título",
        showGrid: saved.showGrid ?? true,
        showAxes: saved.showAxes ?? true,
        background: saved.background || "#f4f4f2",
        hydrated: true,
      });
    } catch { set({ hydrated: true }); }
  },

  persist: () => {
    if (typeof window === "undefined") return;
    const { objects, projectName, showGrid, showAxes, background } = get();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ objects, projectName, showGrid, showAxes, background } satisfies PersistedState));
  },

  checkpoint: () => {
    const { objects, selectedIds, past } = get();
    set({ past: [...past.slice(-(HISTORY_LIMIT - 1)), snapshot(objects, selectedIds)], future: [] });
  },

  undo: () => {
    const { past, future, objects, selectedIds } = get();
    const previous = past.at(-1);
    if (!previous) return;
    set({ objects: cloneObjects(previous.objects), selectedIds: [...previous.selectedIds], past: past.slice(0, -1), future: [snapshot(objects, selectedIds), ...future].slice(0, HISTORY_LIMIT) });
    queueMicrotask(() => get().persist());
  },

  redo: () => {
    const { past, future, objects, selectedIds } = get();
    const next = future[0];
    if (!next) return;
    set({ objects: cloneObjects(next.objects), selectedIds: [...next.selectedIds], past: [...past, snapshot(objects, selectedIds)].slice(-HISTORY_LIMIT), future: future.slice(1) });
    queueMicrotask(() => get().persist());
  },

  addObject: (kind, position = [0, 0, 0]) => {
    get().checkpoint();
    const object = defaultObject(kind, position);
    set((state) => ({ objects: [...state.objects, object], selectedIds: [object.id] }));
    queueMicrotask(() => get().persist());
  },

  updateObject: (id, patch, recordHistory = false) => {
    if (recordHistory) get().checkpoint();
    set((state) => ({ objects: state.objects.map((object) => object.id === id ? { ...object, ...patch } : object) }));
    queueMicrotask(() => get().persist());
  },

  renameObject: (id, name) => get().updateObject(id, { name }, true),
  selectObject: (id, additive = false) => {
    const object = get().objects.find((item) => item.id === id);
    if (!object || object.locked) return;
    set((state) => {
      if (!additive) return { selectedIds: [id] };
      if (state.selectedIds.includes(id)) return { selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id) };
      return { selectedIds: [...state.selectedIds, id] };
    });
  },
  clearSelection: () => set({ selectedIds: [] }),

  deleteSelected: () => {
    const { selectedIds } = get();
    if (!selectedIds.length) return;
    get().checkpoint();
    set((state) => ({ objects: state.objects.filter((object) => !selectedIds.includes(object.id)), selectedIds: [] }));
    queueMicrotask(() => get().persist());
  },

  duplicateSelected: () => {
    const { selectedIds, objects } = get();
    const selected = objects.filter((object) => selectedIds.includes(object.id));
    if (!selected.length) return;
    get().checkpoint();
    const duplicates = selected.map((object) => ({
      ...object,
      id: crypto.randomUUID(),
      name: `${object.name} copia`,
      position: [object.position[0] + 0.35, object.position[1] + 0.35, object.position[2] + 0.2] as Vec3,
      rotation: [...object.rotation] as Vec3,
      scale: [...object.scale] as Vec3,
    }));
    set((state) => ({ objects: [...state.objects, ...duplicates], selectedIds: duplicates.map((object) => object.id) }));
    queueMicrotask(() => get().persist());
  },

  toggleVisible: (id) => {
    const object = get().objects.find((item) => item.id === id);
    if (!object) return;
    get().updateObject(id, { visible: !object.visible }, true);
  },
  toggleLocked: (id) => {
    const object = get().objects.find((item) => item.id === id);
    if (!object) return;
    get().updateObject(id, { locked: !object.locked }, true);
    if (!object.locked) set((state) => ({ selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id) }));
  },
  setTransformMode: (transformMode) => set({ transformMode }),
  setShowGrid: (showGrid) => { set({ showGrid }); queueMicrotask(() => get().persist()); },
  setShowAxes: (showAxes) => { set({ showAxes }); queueMicrotask(() => get().persist()); },
  setBackground: (background) => { set({ background }); queueMicrotask(() => get().persist()); },
  requestCameraView: (cameraView) => set((state) => ({ cameraView, cameraRequestId: state.cameraRequestId + 1 })),
  setProjectName: (projectName) => { set({ projectName }); queueMicrotask(() => get().persist()); },
  newProject: () => {
    if (get().objects.length) get().checkpoint();
    set({ objects: [], selectedIds: [], projectName: "Proyecto sin título", background: "#f4f4f2" });
    queueMicrotask(() => get().persist());
  },
}));
