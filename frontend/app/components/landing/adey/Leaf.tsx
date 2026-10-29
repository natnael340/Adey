import React from "react";
import * as THREE from "three";
import { merge, useGeometry, type Kit } from "./kit";

const LENGTH = 0.72;
const MAX_WIDTH = 0.2;

// Up and out past the left arm; turned so the blade shows its width from the front, side and back alike
const LEAF_UP = new THREE.Vector3(0.7, 0.62, -0.35).normalize();
const LEAF_ACROSS = new THREE.Vector3().crossVectors(LEAF_UP, new THREE.Vector3(1, 0, 1)).normalize();
const LEAF_NORMAL = new THREE.Vector3().crossVectors(LEAF_ACROSS, LEAF_UP).normalize();

function leafPoint(x: number, along: number, face = 0) {
  const t = along / LENGTH;
  const width = MAX_WIDTH * Math.pow(Math.sin(Math.PI * Math.max(0.015, Math.min(0.985, t))), 0.78);
  const z = -0.055 * t * t + 0.012 * (x / Math.max(width, 0.001)) ** 2;
  const puff = 0.03 * Math.max(0, 1 - (x / Math.max(width, 0.001)) ** 2) * Math.sqrt(Math.max(0, Math.sin(Math.PI * t)));
  const point = new THREE.Vector3()
    .addScaledVector(LEAF_ACROSS, x)
    .addScaledVector(LEAF_UP, along)
    .addScaledVector(LEAF_NORMAL, z + face * (puff + 0.003));
  return point;
}

function makeLeaf() {
  const rows = 32;
  const columns = 20;
  const positions: number[] = [];
  const indices: number[] = [];
  const surfaceCount = (rows + 1) * (columns + 1);
  for (let row = 0; row <= rows; row++) {
    const t = row / rows;
    const along = LENGTH * t;
    const width = MAX_WIDTH * Math.pow(Math.sin(Math.PI * Math.max(0.015, Math.min(0.985, t))), 0.78);
    for (let column = 0; column <= columns; column++) {
      const x = width * (column / columns * 2 - 1);
      positions.push(...leafPoint(x, along, 1).toArray());
      positions.push(...leafPoint(x, along, -1).toArray());
    }
  }
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const a = (row * (columns + 1) + column) * 2;
      const b = a + (columns + 1) * 2;
      indices.push(a, b, a + 2, b, b + 2, a + 2);
      indices.push(a + 1, a + 3, b + 1, b + 1, a + 3, b + 3);
    }
  }
  // Join the front and back along the outline to make the blade closed.
  const perimeter: number[] = [];
  for (let c = 0; c <= columns; c++) perimeter.push(c * 2);
  for (let r = 1; r <= rows; r++) perimeter.push((r * (columns + 1) + columns) * 2);
  for (let c = columns - 1; c >= 0; c--) perimeter.push((rows * (columns + 1) + c) * 2);
  for (let r = rows - 1; r > 0; r--) perimeter.push((r * (columns + 1)) * 2);
  for (let i = 0; i < perimeter.length; i++) {
    const vertex = perimeter[i];
    const next = perimeter[(i + 1) % perimeter.length];
    indices.push(vertex, vertex + 1, next, next, vertex + 1, next + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function makeVeins() {
  const paths: THREE.Vector3[][] = [];
  for (const face of [-0.002, 0.002]) {
    const midrib: THREE.Vector3[] = [];
    for (let i = 0; i <= 20; i++) midrib.push(leafPoint(0, LENGTH * i / 20, face));
    paths.push(midrib);
    for (const side of [-1, 1]) {
      for (const t0 of [0.25, 0.43, 0.61, 0.77]) {
        const start = LENGTH * t0;
        const end = Math.min(LENGTH * 0.94, start + LENGTH * 0.2);
        const startWidth = MAX_WIDTH * Math.pow(Math.sin(Math.PI * t0), 0.78);
        const endWidth = MAX_WIDTH * Math.pow(Math.sin(Math.PI * (end / LENGTH)), 0.78);
        paths.push([
          leafPoint(0, start, face),
          leafPoint(side * startWidth * 0.48, start + (end - start) * 0.45, face),
          leafPoint(side * endWidth * 0.83, end, face),
        ]);
      }
    }
  }
  return merge(paths.map((points) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 12, 0.006, 5, false)));
}

export default function Leaf({ kit }: { kit: Kit }) {
  const blade = useGeometry(makeLeaf);
  const veins = useGeometry(makeVeins);

  return (
    <group position={[0.15, -0.56, -0.2]}>
      <mesh geometry={blade} material={kit.leaf} />
      <mesh geometry={veins} material={kit.vein} />
    </group>
  );
}
