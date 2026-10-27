import React, { forwardRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { useGeometry, type Kit } from "./kit";
import { onHead } from "./Head";

const EYE_Y = -0.06;
const EYE_SIZE = [0.14, 0.155, 0.05] as const;
const IRIS_ANGLE = 1.12;
const PUPIL_ANGLE = 0.5;
const EYE_PLACEMENTS = [-1, 1].map((side) => {
  const placement = onHead(side * 0.26, EYE_Y, 0.03);
  return {
    side,
    position: placement.position.sub(new THREE.Vector3(0, EYE_Y, 0)),
    quaternion: placement.quaternion,
  };
});

// A cap of the unit sphere around +z, so it can roll across the eyeball without leaving it
function sphereCap(radius: number, angle: number) {
  const geometry = new THREE.SphereGeometry(radius, 48, 16, 0, Math.PI * 2, 0, angle);
  geometry.rotateX(Math.PI / 2);
  return geometry;
}

// Sparkles sit on the eyeball surface and stay put while the iris moves, like a reflection
function onEye(x: number, y: number) {
  const z = EYE_SIZE[2] * Math.sqrt(Math.max(0, 1 - (x / EYE_SIZE[0]) ** 2 - (y / EYE_SIZE[1]) ** 2));
  return [x, y, z + 0.006] as const;
}

type ParamType = {
  kit: Kit;
  // One group per eye: the scene sets its x/y rotation to roll the iris towards what Adey looks at
  gaze: MutableRefObject<THREE.Group[]>;
};

// The ref'd group sits at the eyes' centre: the scene squashes it to blink
const Eyes = forwardRef<THREE.Group, ParamType>(function Eyes({ kit, gaze }, ref) {
  const irisGeometry = useGeometry(() => {
    const geometry = sphereCap(1.01, IRIS_ANGLE);
    const positions = geometry.getAttribute("position");
    const colors = new Float32Array(positions.count * 3);
    const dark = new THREE.Color("#1E0F05");
    const warm = new THREE.Color("#9A5622");
    const color = new THREE.Color();
    for (let i = 0; i < positions.count; i += 1) {
      const rim = Math.acos(THREE.MathUtils.clamp(positions.getZ(i) / 1.01, -1, 1)) / IRIS_ANGLE;
      // Warm amber low in the iris, dark at the top and in a ring round the edge
      const glow = THREE.MathUtils.smoothstep(-positions.getY(i), -0.2, 0.8) * (1 - THREE.MathUtils.smoothstep(rim, 0.7, 0.95));
      color.copy(dark).lerp(warm, glow);
      colors.set([color.r, color.g, color.b], i * 3);
    }
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  });
  const pupilGeometry = useGeometry(() => sphereCap(1.02, PUPIL_ANGLE));
  const lidGeometry = useGeometry(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 24; i += 1) {
      const angle = Math.PI * (0.22 + 0.56 * i / 24);
      points.push(new THREE.Vector3(0.145 * Math.cos(angle), 0.16 * Math.sin(angle), 0.02));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 32, 0.009, 8, false);
  });

  return (
    <group position={[0, EYE_Y, 0]}>
      <group ref={ref}>
        {EYE_PLACEMENTS.map(({ side, position, quaternion }, i) => (
          <group key={side} position={position} quaternion={quaternion}>
            <group scale={EYE_SIZE}>
              <mesh geometry={kit.sphere} material={kit.sclera} />
              <group
                ref={(g) => {
                  if (g) gaze.current[i] = g;
                }}
              >
                <mesh geometry={irisGeometry} material={kit.iris} />
                <mesh geometry={pupilGeometry} material={kit.pupil} />
              </group>
            </group>
            <mesh geometry={kit.sphere} material={kit.shine} position={onEye(0.042, 0.05)} scale={[0.032, 0.032, 0.006]} />
            <mesh geometry={kit.sphere} material={kit.shine} position={onEye(-0.04, -0.045)} scale={[0.014, 0.014, 0.006]} />
            <mesh geometry={lidGeometry} material={kit.seed} />
          </group>
        ))}
      </group>
    </group>
  );
});

export default Eyes;
