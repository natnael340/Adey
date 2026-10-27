import React, { forwardRef } from "react";
import * as THREE from "three";
import { merge, useGeometry, type Kit } from "./kit";
import { onHead } from "./Head";

const BROW_Y = 0.20;

function makeBrow(side: number) {
  const centerZ = onHead(side * 0.27, BROW_Y, 0).position.z;
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= 16; i += 1) {
    const t = i / 16;
    const localX = (t * 2 - 1) * 0.065;
    const x = side * 0.27 + localX;
    const inner = side * localX < 0;
    const y = 0.014 * (1 - Math.pow(localX / 0.065, 2)) - (inner ? 0.003 : 0);
    const surface = onHead(x, BROW_Y + y, -0.002).position;
    points.push(new THREE.Vector3(x, y, surface.z - centerZ));
  }
  const curve = new THREE.CatmullRomCurve3(points);
  const segments = 32;
  const radial = 8;
  const geometry = new THREE.TubeGeometry(curve, segments, 0.006, radial, false);
  const positions = geometry.getAttribute("position") as THREE.BufferAttribute;
  for (let ring = 0; ring <= segments; ring += 1) {
    const t = ring / segments;
    const taper = Math.min(1, Math.max(0.18, Math.min(t / 0.16, (1 - t) / 0.16)));
    const center = curve.getPointAt(t);
    for (let vertex = 0; vertex <= radial; vertex += 1) {
      const index = ring * (radial + 1) + vertex;
      const point = new THREE.Vector3().fromBufferAttribute(positions, index);
      point.sub(center).multiplyScalar(taper).add(center);
      positions.setXYZ(index, point.x, point.y, point.z);
    }
  }
  geometry.computeVertexNormals();
  return geometry;
}

const Brows = forwardRef<THREE.Group, { kit: Kit }>(function Brows({ kit }, ref) {
  const geometry = useGeometry(() => merge([-1, 1].map(makeBrow)));
  const centerZ = onHead(0, BROW_Y, 0).position.z;
  return (
    <group position={[0, BROW_Y, centerZ]}>
      <group ref={ref}>
        <mesh geometry={geometry} material={kit.seed} />
      </group>
    </group>
  );
});

export default Brows;
