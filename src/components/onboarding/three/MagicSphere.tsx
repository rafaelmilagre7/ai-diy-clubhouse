
import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";

interface MagicSphereProps {
  stage?: number;
  isAnimating?: boolean;
}

export function MagicSphere({ stage = 1, isAnimating = false }: MagicSphereProps) {
  const sphereRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!);
  
  // Cor base com base no estágio
  const baseColor = new THREE.Color("#0ABAB5");
  
  // Efeito de animação
  useFrame((state, delta) => {
    if (!sphereRef.current) return;
    
    // Rotação básica sempre presente
    sphereRef.current.rotation.x += delta * 0.2;
    sphereRef.current.rotation.y += delta * 0.3;
    
    // Efeitos adicionais quando estiver animando
    if (isAnimating && materialRef.current) {
      // Pulsar com mais intensidade
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 0.8;
      sphereRef.current.scale.set(pulse, pulse, pulse);
      
      // Emissão com cor variável
      const emissiveIntensity = Math.sin(state.clock.elapsedTime * 2) * 0.5 + 0.5;
      materialRef.current.emissiveIntensity = emissiveIntensity;
      
      // Particulas ou distorção poderiam ser adicionadas aqui
    }
  });
  
  return (
    <Sphere ref={sphereRef} args={[1, 32, 32]}>
      <meshStandardMaterial
        ref={materialRef}
        color={baseColor}
        emissive={baseColor}
        emissiveIntensity={0.5}
        roughness={0.3}
        metalness={0.8}
      />
    </Sphere>
  );
}
