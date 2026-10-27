import React from "react";
import * as THREE from "three";
import { merge, useGeometry, type Kit } from "./kit";

const WIDTH = 0.53;
const DEPTH = 0.45;
const TOP = 0.46;
const BOTTOM = 0.4;
const EXPONENT = 2.2;
const POWER = 2 / EXPONENT;

function signedPower(value: number, power: number) {
  return Math.sign(value) * Math.pow(Math.abs(value), power);
}

// The gradient of the superellipsoid; the top and bottom halves have their own heights
function normalAt(x: number, y: number, z: number) {
  const height = y >= 0 ? TOP : BOTTOM;
  return new THREE.Vector3(
    signedPower(x / WIDTH, EXPONENT - 1) / WIDTH,
    signedPower(y / height, EXPONENT - 1) / height,
    signedPower(z / DEPTH, EXPONENT - 1) / DEPTH,
  ).normalize();
}

function headPoint(x: number, y: number) {
  const height = y >= 0 ? TOP : BOTTOM;
  const vertical = Math.pow(Math.abs(y / height), EXPONENT);
  const crossSection = Math.max(0, 1 - vertical);
  const xTerm = Math.pow(Math.abs(x / WIDTH), EXPONENT);
  const z = DEPTH * Math.pow(Math.max(0, crossSection - xTerm), 1 / EXPONENT);
  return { point: new THREE.Vector3(x, y, z), normal: normalAt(x, y, z) };
}

export function onHead(x: number, y: number, inset: number): { position: THREE.Vector3; quaternion: THREE.Quaternion } {
  const { point, normal } = headPoint(x, y);
  return {
    position: point.clone().addScaledVector(normal, -inset),
    quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal),
  };
}

console.assert(Math.abs(onHead(0, 0, 0).position.z - 0.45) < 0.001, "Head front surface should match its half-depth");

function makeHeadGeometry() {
  const latitudes = 48;
  const longitudes = 96;
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  for (let row = 0; row <= latitudes; row += 1) {
    const latitude = -Math.PI / 2 + (Math.PI * row) / latitudes;
    const sin = Math.sin(latitude);
    const cos = Math.cos(latitude);
    const y = (sin >= 0 ? TOP : BOTTOM) * signedPower(sin, POWER);
    const ring = Math.pow(Math.max(0, cos), POWER);
    for (let column = 0; column <= longitudes; column += 1) {
      const angle = (2 * Math.PI * column) / longitudes;
      const x = WIDTH * ring * signedPower(Math.cos(angle), POWER);
      const z = DEPTH * ring * signedPower(Math.sin(angle), POWER);
      positions.push(x, y, z);
      const normal = normalAt(x, y, z);
      normals.push(normal.x, normal.y, normal.z);
      if (row < latitudes && column < longitudes) {
        const a = row * (longitudes + 1) + column;
        const b = a + longitudes + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  return geometry;
}

export default function Head({ kit }: { kit: Kit }) {
  const geometry = useGeometry(makeHeadGeometry);
  const cheekGeometry = useGeometry(() => merge([-1, 1].map((side) => {
    const positions: number[] = [];
    const normals: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    const rings = 12;
    const segments = 64;
    const center = onHead(side * 0.33, -0.265, -0.002);
    positions.push(center.position.x, center.position.y, center.position.z);
    const centerNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(center.quaternion);
    normals.push(centerNormal.x, centerNormal.y, centerNormal.z);
    colors.push(1, 1, 1, 1);
    for (let ring = 1; ring <= rings; ring += 1) {
      const radius = ring / rings;
      for (let segment = 0; segment < segments; segment += 1) {
        const angle = (segment / segments) * Math.PI * 2;
        const u = radius * Math.cos(angle);
        const v = radius * Math.sin(angle);
        const x = u * 0.066;
        const y = v * 0.052;
        const { position, quaternion } = onHead(side * 0.33 + x, y - 0.265, -0.002);
        const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion);
        const fade = Math.max(0, Math.min(1, (1 - radius) / 0.42));
        positions.push(position.x, position.y, position.z);
        normals.push(normal.x, normal.y, normal.z);
        colors.push(1, 1, 1, fade);
      }
    }
    for (let segment = 0; segment < segments; segment += 1) {
      const next = (segment + 1) % segments;
      indices.push(0, 1 + segment, 1 + next);
    }
    for (let ring = 1; ring < rings; ring += 1) {
      const inner = 1 + (ring - 1) * segments;
      const outer = 1 + ring * segments;
      for (let segment = 0; segment < segments; segment += 1) {
        const next = (segment + 1) % segments;
        const a = inner + segment;
        const b = inner + next;
        const c = outer + segment;
        const d = outer + next;
        indices.push(a, c, b, b, c, d);
      }
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    result.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    result.setAttribute("color", new THREE.Float32BufferAttribute(colors, 4));
    result.setIndex(indices);
    return result;
  })));
  return (
    <>
      <mesh geometry={geometry} material={kit.clay} />
      <mesh geometry={cheekGeometry} material={kit.cheek} />
    </>
  );
}
