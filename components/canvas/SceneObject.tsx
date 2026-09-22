"use client";

import { TransformControls } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useEditorStore } from "@/store/editorStore";
import { MorfoObject, Vec3 } from "@/types/morfo";

function makeShape(kind: MorfoObject["kind"]) {
  const shape = new THREE.Shape();
  if (kind === "circle" || kind === "point") {
    const radius = kind === "point" ? 0.25 : 0.8;
    shape.absarc(0, 0, radius, 0, Math.PI * 2, false);
    return shape;
  }
  if (kind === "square" || kind === "plane") {
    const size = kind === "plane" ? 1.9 : 1.5;
    shape.moveTo(-size / 2, -size / 2);
    shape.lineTo(size / 2, -size / 2);
    shape.lineTo(size / 2, size / 2);
    shape.lineTo(-size / 2, size / 2);
    shape.closePath();
    return shape;
  }
  const sides = kind === "triangle" ? 3 : kind === "hexagon" ? 6 : 10;
  const outer = 0.85;
  const inner = kind === "star" ? 0.38 : outer;
  for (let i = 0; i < sides; i += 1) {
    const radius = kind === "star" && i % 2 === 1 ? inner : outer;
    const angle = -Math.PI / 2 + (i / sides) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

function ShapeMesh({ object }: { object: MorfoObject }) {
  const geometry = useMemo(() => {
    if (object.kind === "line") return new THREE.BoxGeometry(1.8, 0.08, 0.06);
    const shape = makeShape(object.kind);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: object.kind === "plane" ? 0.02 : 0.08, bevelEnabled: false });
    geometry.translate(0, 0, -(object.kind === "plane" ? 0.01 : 0.04));
    return geometry;
  }, [object.kind]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color={object.color} transparent opacity={object.opacity} roughness={0.65} metalness={0.02} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function SceneObject({ object }: { object: MorfoObject }) {
  const group = useRef<THREE.Group>(null);
  const selectedIds = useEditorStore((state) => state.selectedIds);
  const transformMode = useEditorStore((state) => state.transformMode);
  const selectObject = useEditorStore((state) => state.selectObject);
  const updateObject = useEditorStore((state) => state.updateObject);
  const checkpoint = useEditorStore((state) => state.checkpoint);
  const isSelected = selectedIds[0] === object.id;

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    selectObject(object.id, event.nativeEvent.shiftKey);
  };

  const content = (
    <group
      ref={group}
      visible={object.visible}
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
      onPointerDown={onPointerDown}
    >
      <ShapeMesh object={object} />
      {selectedIds.includes(object.id) && (
        <mesh position={[0, 0, 0.065]}>
          <ringGeometry args={[0.94, 0.97, 64]} />
          <meshBasicMaterial color="#111111" transparent opacity={0.35} depthTest={false} />
        </mesh>
      )}
    </group>
  );

  if (!isSelected || object.locked) return content;

  return (
    <TransformControls
      mode={transformMode}
      onMouseDown={() => checkpoint()}
      onObjectChange={() => {
        const current = group.current;
        if (!current) return;
        updateObject(object.id, {
          position: current.position.toArray() as Vec3,
          rotation: [current.rotation.x, current.rotation.y, current.rotation.z],
          scale: current.scale.toArray() as Vec3,
        });
      }}
    >
      {content}
    </TransformControls>
  );
}
