import React, { type Ref } from "react";
import * as THREE from "three";
import { useGeometry, type Kit } from "./kit";

// How far each arm swings out from the body at rest; the scene waves the right arm up from here
export const ARM_REST = 0.75;

export default function Arms({ kit, waveArm }: { kit: Kit; waveArm: Ref<THREE.Group> }) {
  const armGeometry = useGeometry(() => new THREE.LatheGeometry([
    new THREE.Vector2(0, -0.43),
    new THREE.Vector2(0.08, -0.42),
    new THREE.Vector2(0.09, -0.38),
    new THREE.Vector2(0.09, -0.28),
    new THREE.Vector2(0.095, -0.16),
    new THREE.Vector2(0.11, -0.06),
    new THREE.Vector2(0.11, 0.10),
  ], 32));
  const pawGeometry = useGeometry(() => {
    const geometry = new THREE.SphereGeometry(1, 40, 32);
    const position = geometry.getAttribute("position");
    for (let index = 0; index < position.count; index += 1) {
      const x = position.getX(index);
      const y = position.getY(index);
      const z = position.getZ(index);
      position.setXYZ(index, Math.sign(x) * Math.pow(Math.abs(x), 0.78), Math.sign(y) * Math.pow(Math.abs(y), 0.78), z);
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  });
  const creaseGeometry = useGeometry(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.045, 0.081),
    new THREE.Vector3(0, -0.075, 0.082),
    new THREE.Vector3(0, -0.092, 0.074),
  ]), 8, 0.005, 5, false));

  return (
    <>
      {[-1, 1].map((side) => (
        <group
          key={side}
          ref={side === 1 ? waveArm : undefined}
          position={[side * 0.25, -0.15, 0]}
          rotation={[0, 0, side * ARM_REST]}
        >
          <mesh geometry={armGeometry} material={kit.clay} />
          <mesh geometry={pawGeometry} material={kit.paw} position={[0, -0.39, 0.012]} scale={[0.125, 0.13, 0.085]} rotation={[0.18, 0, side * -0.16]} />
          {[-0.03, 0.03].map((x) => (
            <mesh key={x} geometry={creaseGeometry} material={kit.crease} position={[x, -0.39, 0.012]} />
          ))}
        </group>
      ))}
    </>
  );
}
