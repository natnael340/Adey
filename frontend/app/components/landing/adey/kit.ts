import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const SEED = "#3A2614";

// Mouth layers sit on the face; each pulls further forward in depth so they never z-fight
function overlay(offset: number, transparent = false) {
  return new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.85, transparent, depthWrite: !transparent,
    polygonOffset: true, polygonOffsetFactor: offset, polygonOffsetUnits: offset,
  });
}

function createKit() {
  return {
    // Every rounded part is this one sphere, scaled into shape
    sphere: new THREE.SphereGeometry(1, 48, 32),
    clay: new THREE.MeshPhysicalMaterial({ color: "#F2C230", roughness: 0.9, sheen: 0.8, sheenRoughness: 0.8, sheenColor: "#FFF2C0" }),
    seed: new THREE.MeshPhysicalMaterial({ color: SEED, roughness: 0.55, sheen: 0.3 }),
    // Paws and feet: a warmer, lighter brown than Seed, like the plush reference
    paw: new THREE.MeshPhysicalMaterial({ color: "#5A381C", roughness: 0.85, sheen: 0.5, sheenRoughness: 0.8, sheenColor: "#9A6A44" }),
    crease: new THREE.MeshStandardMaterial({ color: "#2A1A0E", roughness: 0.9 }),
    cream: new THREE.MeshStandardMaterial({ color: "#FFF6DC", roughness: 0.65 }),
    cheek: new THREE.MeshStandardMaterial({
      color: "#F7A08C", roughness: 0.8, transparent: true, opacity: 0.85, vertexColors: true,
      depthWrite: false, side: THREE.DoubleSide,
    }),
    leaf: new THREE.MeshPhysicalMaterial({ color: "#1E4D3A", roughness: 0.55, sheen: 0.3 }),
    vein: new THREE.MeshStandardMaterial({ color: "#163A2B", roughness: 0.7 }),
    iris: new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05 }),
    pupil: new THREE.MeshPhysicalMaterial({ color: "#0C0603", roughness: 0.15, clearcoat: 1 }),
    sclera: new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.3 }),
    // Unlit so the eye sparkle stays bright from every angle
    shine: new THREE.MeshBasicMaterial({ color: "#FFFFFF" }),
    lip: overlay(-1, true),
    cavity: overlay(-2),
    tongue: overlay(-3),
    shadow: new THREE.MeshBasicMaterial({ color: SEED, vertexColors: true, transparent: true, opacity: 0.4, depthWrite: false }),
  };
}

export type Kit = ReturnType<typeof createKit>;

// Shared geometry and materials, made once per scene
export function useKit() {
  const kit = useMemo(createKit, []);
  useEffect(() => () => Object.values(kit).forEach((item) => item.dispose()), [kit]);
  return kit;
}

// A part's own geometry, disposed with the part
export function useGeometry<T extends THREE.BufferGeometry>(create: () => T) {
  const geometry = useMemo(create, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

// One geometry from several with the same attributes, so a part draws as one mesh
export function merge(geometries: THREE.BufferGeometry[]) {
  const merged = mergeGeometries(geometries);
  if (!merged) throw new Error("Geometries to merge need the same attributes");
  return merged;
}
