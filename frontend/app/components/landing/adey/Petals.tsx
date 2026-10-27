import React, { type MutableRefObject } from "react";
import * as THREE from "three";
import type { Kit } from "./kit";
import { useGeometry } from "./kit";

// lean: how far the long axis tips back; the top ones lean most so they don't stand up like ears from the side
const PETALS = [
  { center: [0, 0.54, -0.12], size: [0.2, 0.19], lean: 0.45 },
  { center: [-0.35, 0.42, -0.2], size: [0.2, 0.19], lean: 0.35 },
  { center: [0.35, 0.42, -0.2], size: [0.2, 0.19], lean: 0.35 },
  { center: [-0.58, 0.13, -0.24], size: [0.19, 0.18], lean: 0.25 },
  { center: [0.58, 0.13, -0.24], size: [0.19, 0.18], lean: 0.25 },
  { center: [-0.56, -0.17, -0.22], size: [0.14, 0.14], lean: 0.25 },
  { center: [0.56, -0.17, -0.22], size: [0.14, 0.14], lean: 0.25 },
];
const PETAL_BASE_OFFSET = 0.12;

type ParamType = {
  kit: Kit;
  // One group per petal: the scene sways its z rotation and slides its first child out along y to bloom
  sways: MutableRefObject<THREE.Group[]>;
};

export default function Petals({ kit, sways }: ParamType) {
  const geometry = useGeometry(() => {
    const shape = new THREE.SphereGeometry(1, 64, 48);
    const positions = shape.attributes.position;
    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      // Plump lens, the front a little fuller
      const back = z < 0 ? z : 0.85 * Math.pow(z, 0.8);
      const endFade = THREE.MathUtils.smoothstep(Math.abs(y), 0.70, 1);
      // Groove on both faces, so the back view shows it too
      const alongFace = THREE.MathUtils.smoothstep(Math.abs(z), 0.35, 0.85);
      // A thin crease, like the reference's seam
      const across = Math.exp(-((x / 0.09) ** 2) / 2);
      const groove = across * (1 - endFade) * alongFace * 0.09 * Math.sign(z);
      const tipWidth = 0.925 + 0.075 * THREE.MathUtils.smoothstep(y, -0.25, 0.8);
      positions.setX(i, x * tipWidth);
      positions.setZ(i, back - groove);
    }
    positions.needsUpdate = true;
    shape.computeVertexNormals();
    return shape;
  });

  return (
    <>
      {PETALS.map(({ center, size, lean }, i) => {
        const [x, y, z] = center;
        const radial = new THREE.Vector3(x, y, 0).normalize();
        // Long axis points out from the head and leans back a little; the face looks forward
        const yAxis = radial.clone().multiplyScalar(Math.cos(lean)).setZ(-Math.sin(lean));
        const xAxis = new THREE.Vector3(radial.y, -radial.x, 0);
        const zAxis = xAxis.clone().cross(yAxis);
        const orientation = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis));
        const base = new THREE.Vector3(x, y, z).addScaledVector(yAxis, -PETAL_BASE_OFFSET);

        return (
          <group key={i} position={base.toArray()} quaternion={orientation}>
            <group
              ref={(g) => {
                if (g) sways.current[i] = g;
              }}
            >
              <group>
                <group position={[0, PETAL_BASE_OFFSET, 0]}>
                  <mesh geometry={geometry} material={kit.clay} scale={[size[0], size[1], 0.14]} />
                </group>
              </group>
            </group>
          </group>
        );
      })}
    </>
  );
}
