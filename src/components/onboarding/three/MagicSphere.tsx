
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MagicSphereProps {
  stage: number;
}

export function MagicSphere({ stage }: MagicSphereProps) {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.6 * delta + 0.2 * (stage + 1);
      mesh.current.rotation.x += 0.1 * delta;
    }
  });
  
  const getColor = () => {
    switch (stage) {
      case 0: return "#ffeab7";
      case 1: return "#0ABAB5";
      case 2: return "#b87ff5";
      default: return "#82e19b";
    }
  };
  
  const getEmissive = () => {
    switch (stage) {
      case 0: return "#ffd580";
      case 1: return "#0ABAB5";
      case 2: return "#9b87f599";
      default: return "#22bb77";
    }
  };
  
  return (
    <mesh ref={mesh} position={[0, 0, 0]} scale={1.2 + 0.2 * stage}>
      <sphereGeometry args={[1.5, 50, 50]} />
      <meshStandardMaterial
        color={getColor()}
        emissive={getEmissive()}
        emissiveIntensity={0.5 + 0.1 * stage}
        metalness={0.37}
        roughness={0.25 + 0.1 * (3 - stage)}
        transparent
        opacity={0.92}
      />
      {/* Aura adicional */}
      <mesh>
        <sphereGeometry args={[2.1 + 0.3 * stage, 32, 32]} />
        <meshStandardMaterial
          color="#fff"
          emissive="#fff"
          emissiveIntensity={0.07 + (stage * 0.04)}
          transparent
          opacity={0.08 + stage * 0.03}
        />
      </mesh>
    </mesh>
  );
}
