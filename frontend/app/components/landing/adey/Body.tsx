import React from "react";
import * as THREE from "three";
import { merge, useGeometry, type Kit } from "./kit";

// A pear whose top keeps rising inside the head, so no lid or seam shows under the chin
const TORSO_PROFILE = [
  new THREE.Vector2(0, -0.76),
  new THREE.Vector2(0.16, -0.745),
  new THREE.Vector2(0.26, -0.7),
  new THREE.Vector2(0.315, -0.62),
  new THREE.Vector2(0.335, -0.5),
  new THREE.Vector2(0.325, -0.38),
  new THREE.Vector2(0.3, -0.26),
  new THREE.Vector2(0.275, -0.15),
  new THREE.Vector2(0.25, -0.06),
  new THREE.Vector2(0.19, 0.02),
  new THREE.Vector2(0.1, 0.07),
  new THREE.Vector2(0, 0.08),
];
const TORSO_CURVE = new THREE.SplineCurve(TORSO_PROFILE);
const TORSO_SAMPLES = TORSO_CURVE.getPoints(256).sort((a, b) => a.y - b.y);

function torsoRadiusAt(y: number) {
  for (let index = 1; index < TORSO_SAMPLES.length; index += 1) {
    if (TORSO_SAMPLES[index].y >= y) {
      const lower = TORSO_SAMPLES[index - 1];
      const upper = TORSO_SAMPLES[index];
      const amount = (y - lower.y) / (upper.y - lower.y);
      return THREE.MathUtils.lerp(lower.x, upper.x, amount);
    }
  }
  return TORSO_SAMPLES[TORSO_SAMPLES.length - 1].x;
}

// Torso, belly patch and feet, below the head
export default function Body({ kit }: { kit: Kit }) {
  const torsoGeometry = useGeometry(() => new THREE.LatheGeometry(TORSO_CURVE.getPoints(64), 48));
  // Rings round the patch centre, so its outline is a smooth egg rather than a staircase
  const bellyGeometry = useGeometry(() => {
    const rings = 24;
    const segments = 96;
    const positions: number[] = [];
    const indices: number[] = [];
    for (let ring = 0; ring <= rings; ring += 1) {
      const r = ring / rings;
      for (let segment = 0; segment < segments; segment += 1) {
        const angle = (segment / segments) * Math.PI * 2;
        const x = r * Math.cos(angle) * (0.2 - 0.015 * Math.sin(angle));
        const y = -0.47 + r * Math.sin(angle) * 0.24;
        const radius = torsoRadiusAt(y);
        const lift = 0.004 + 0.009 * Math.sqrt(1 - r * r);
        positions.push(x, y, 0.85 * Math.sqrt(Math.max(0, radius * radius - x * x)) + lift);
        if (ring < rings) {
          const a = ring * segments + segment;
          const b = ring * segments + ((segment + 1) % segments);
          indices.push(a, a + segments, b, b, a + segments, b + segments);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  });
  const creaseGeometry = useGeometry(() => merge([-1, 1].flatMap((side) => [-1, 1].map((offset) => {
    const x = side * 0.21 + offset * 0.045;
    const y0 = -0.82;
    const y1 = -0.89;
    const frontZ = (y: number) => 0.05 + 0.18 * Math.sqrt(Math.max(0.01, 1 - ((x - side * 0.21) / 0.15) ** 2 - ((y + 0.86) / 0.075) ** 2)) + 0.002;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, y0, frontZ(y0)),
      new THREE.Vector3(x, -0.842, frontZ(-0.842)),
      new THREE.Vector3(x, y1, frontZ(y1)),
    ]);
    return new THREE.TubeGeometry(curve, 12, 0.0045, 6, false);
  }))));

  return (
    <>
      <mesh geometry={torsoGeometry} material={kit.clay} scale={[1, 1, 0.85]} />
      <mesh geometry={bellyGeometry} material={kit.cream} />
      {[-1, 1].map((side) => (
        <React.Fragment key={side}>
          <mesh geometry={kit.sphere} material={kit.clay} position={[side * 0.19, -0.74, 0]} scale={[0.075, 0.12, 0.075]} />
          <mesh geometry={kit.sphere} material={kit.paw} position={[side * 0.21, -0.86, 0.05]} scale={[0.15, 0.075, 0.18]} />
        </React.Fragment>
      ))}
      <mesh geometry={creaseGeometry} material={kit.crease} />
    </>
  );
}
