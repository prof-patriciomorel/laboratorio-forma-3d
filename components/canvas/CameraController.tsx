"use client";

import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useEditorStore } from "@/store/editorStore";

const VIEW_POSITIONS = {
  front: [0, 0, 10],
  back: [0, 0, -10],
  left: [-10, 0, 0],
  right: [10, 0, 0],
  top: [0, 10, 0.001],
  bottom: [0, -10, 0.001],
  iso: [7, 6, 8],
  perspective: [6, 4.5, 9],
} as const;

export function CameraController() {
  const controls = useRef<OrbitControlsImpl>(null);
  const camera = useThree((state) => state.camera);
  const cameraView = useEditorStore((state) => state.cameraView);
  const cameraRequestId = useEditorStore((state) => state.cameraRequestId);

  useEffect(() => {
    const position = VIEW_POSITIONS[cameraView];
    camera.position.set(...position);
    camera.lookAt(0, 0, 0);
    controls.current?.target.set(0, 0, 0);
    controls.current?.update();
  }, [camera, cameraRequestId, cameraView]);

  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} />;
}
