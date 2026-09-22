"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";
import { useEditorStore } from "@/store/editorStore";
import { MorfoObjectKind } from "@/types/morfo";
import { CameraController } from "./CameraController";
import { SceneObject } from "./SceneObject";

function Scene() {
  const objects = useEditorStore((state) => state.objects);
  const showGrid = useEditorStore((state) => state.showGrid);
  const showAxes = useEditorStore((state) => state.showAxes);
  const background = useEditorStore((state) => state.background);
  const clearSelection = useEditorStore((state) => state.clearSelection);

  return (
    <>
      <color attach="background" args={[background]} />
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 8, 8]} intensity={2.2} castShadow />
      <directionalLight position={[-6, 1, 4]} intensity={0.8} />
      {showGrid && <gridHelper args={[20, 20, new THREE.Color("#c8c8c3"), new THREE.Color("#dededa")]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.12]} />}
      {showAxes && <axesHelper args={[3.2]} />}
      <mesh position={[0, 0, -0.18]} onPointerDown={(event) => { event.stopPropagation(); clearSelection(); }}>
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {objects.map((object) => <SceneObject key={object.id} object={object} />)}
      <CameraController />
    </>
  );
}

export function SpatialCanvas() {
  const addObject = useEditorStore((state) => state.addObject);

  return (
    <div
      className="canvas-wrap"
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes("application/x-morfo-shape")) {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        const kind = event.dataTransfer.getData("application/x-morfo-shape") as MorfoObjectKind;
        if (!kind) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 9;
        const y = -((event.clientY - rect.top) / rect.height - 0.5) * 6;
        addObject(kind, [x, y, 0]);
      }}
    >
      <Canvas shadows dpr={[1, 1.75]} camera={{ position: [7, 6, 8], fov: 45, near: 0.1, far: 100 }} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}><Scene /></Suspense>
      </Canvas>
      <div className="canvas-caption">Arrastrá formas al espacio · orbitá con el mouse · scroll para zoom</div>
    </div>
  );
}
