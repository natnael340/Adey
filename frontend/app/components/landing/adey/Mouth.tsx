import React, { forwardRef, useMemo } from "react";
import * as THREE from "three";
import { onHead } from "./Head";
import { useGeometry, type Kit } from "./kit";

function mouthShape() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.08, 0.038);
  shape.quadraticCurveTo(-0.08, 0.058, -0.058, 0.056);
  shape.quadraticCurveTo(0, 0.046, 0.058, 0.056);
  shape.quadraticCurveTo(0.08, 0.058, 0.08, 0.038);
  shape.bezierCurveTo(0.08, -0.01, 0.038, -0.0575, 0, -0.0575);
  shape.bezierCurveTo(-0.038, -0.0575, -0.08, -0.01, -0.08, 0.038);
  return shape;
}

function tongueShape() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.066, -0.006);
  shape.quadraticCurveTo(0, 0.046, 0.066, -0.006);
  shape.bezierCurveTo(0.062, -0.032, 0.03, -0.052, 0, -0.052);
  shape.bezierCurveTo(-0.03, -0.052, -0.062, -0.032, -0.066, -0.006);
  return shape;
}

const CENTER_Y = -0.235;
const RINGS = 10;

type Shade = (ring: number, y: number) => [THREE.Color, number];

// Rings out from the centroid, so every vertex sits on the curved face; big flat triangles would sink into it
function conform(shape: THREE.Shape, inset: number, shade: Shade, grow = 1, squash = 1) {
  const outline = shape.getSpacedPoints(96).slice(0, -1);
  if (THREE.ShapeUtils.isClockWise(outline)) outline.reverse();
  const centre = outline.reduce((sum, p) => sum.add(p), new THREE.Vector2()).divideScalar(outline.length);
  const centerZ = onHead(0, CENTER_Y, 0).position.z;
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  for (let ring = 0; ring <= RINGS; ring += 1) {
    const r = ring / RINGS;
    for (const point of ring === 0 ? [centre] : outline) {
      const x = centre.x + (point.x - centre.x) * r * grow;
      const y = (centre.y + (point.y - centre.y) * r * grow) * squash;
      positions.push(x, y, onHead(x, y + CENTER_Y, inset).position.z - centerZ);
      const [color, alpha] = shade(r, y);
      colors.push(color.r, color.g, color.b, alpha);
    }
  }
  const n = outline.length;
  for (let j = 0; j < n; j += 1) indices.push(0, 1 + j, 1 + ((j + 1) % n));
  for (let ring = 1; ring < RINGS; ring += 1) {
    const inner = 1 + (ring - 1) * n;
    const outer = inner + n;
    for (let j = 0; j < n; j += 1) {
      const k = (j + 1) % n;
      indices.push(inner + j, outer + j, inner + k, inner + k, outer + j, outer + k);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 4));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

// Open by default; the morph target squashes it nearly shut for thinking
function makeMorphGeometry(shape: THREE.Shape, inset: number, shade: Shade, grow = 1) {
  const geometry = conform(shape, inset, shade, grow);
  const thinking = conform(shape, inset, shade, grow, 0.25);
  geometry.morphAttributes.position = [thinking.getAttribute("position").clone()];
  thinking.dispose();
  return geometry;
}

const LIP = new THREE.Color("#B0701A");
const THROAT = new THREE.Color("#3A0E14");
const CAVITY = new THREE.Color("#6A1E26");
const TONGUE = new THREE.Color("#E8706A");
const TONGUE_TOP = new THREE.Color("#F7A39A");
const GROW = 1.3;

// A soft ochre halo just outside the hole, so it reads as pressed into the plush instead of outlined
const lip: Shade = (r) => [LIP, 0.5 * (1 - THREE.MathUtils.smoothstep(r * GROW, 1, GROW))];
// Darkest under the upper lip, like a shadow inside the mouth
const cavity: Shade = (_r, y) => [THROAT.clone().lerp(CAVITY, 1 - THREE.MathUtils.smoothstep(y, -0.05, 0.05)), 1];
const tongue: Shade = (r) => [TONGUE_TOP.clone().lerp(TONGUE, THREE.MathUtils.smoothstep(r, 0, 0.9)), 1];

// The scene animates each child mesh's first morph influence; keep this group at unit scale.
const Mouth = forwardRef<THREE.Group, { kit: Kit }>(function Mouth({ kit }, ref) {
  const rim = useGeometry(() => makeMorphGeometry(mouthShape(), -0.002, lip, GROW));
  const hole = useGeometry(() => makeMorphGeometry(mouthShape(), -0.003, cavity));
  const tongueGeometry = useGeometry(() => makeMorphGeometry(tongueShape(), -0.006, tongue));
  const surface = useMemo(() => onHead(0, CENTER_Y, 0), []);

  return (
    <group position={surface.position}>
      <group ref={ref}>
        <mesh geometry={rim} material={kit.lip} onUpdate={(mesh) => mesh.updateMorphTargets()} />
        <mesh geometry={hole} material={kit.cavity} onUpdate={(mesh) => mesh.updateMorphTargets()} />
        <mesh geometry={tongueGeometry} material={kit.tongue} onUpdate={(mesh) => mesh.updateMorphTargets()} />
      </group>
    </group>
  );
});

export default Mouth;
