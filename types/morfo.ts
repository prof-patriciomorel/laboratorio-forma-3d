export type Vec3 = [number, number, number];

export type MorfoObjectKind =
  | "circle"
  | "square"
  | "triangle"
  | "hexagon"
  | "star"
  | "point"
  | "line"
  | "plane";

export type MorfoObject = {
  id: string;
  name: string;
  kind: MorfoObjectKind;
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
  color: string;
  opacity: number;
  visible: boolean;
  locked: boolean;
};

export type TransformMode = "translate" | "rotate" | "scale";
export type CameraView = "perspective" | "front" | "back" | "left" | "right" | "top" | "bottom" | "iso";

export type SceneSnapshot = {
  objects: MorfoObject[];
  selectedIds: string[];
};
