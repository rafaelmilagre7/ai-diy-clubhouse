
import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";

interface MagicSphereProps {
  stage: number;
}

export function MagicSphere({ stage }: MagicSphereProps) {
  const sphereRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Cores adaptadas para usar formatos que o Three.js reconhece
  const colors = useMemo(() => [
    { main: "#0ABAB5", glow: "#0ABAB5" },       // Turquesa VIVER DE IA
    { main: "#0ABAB5", glow: "#87f5f3" },       // Turquesa pulsando 
    { main: "#9b87f5", glow: "#c4b9ff" },       // Roxo para terceiro estágio
    { main: "#4ade80", glow: "#86efac" },       // Verde para conclusão
  ], []);

  // Velocidade com base no estágio
  const getSpeed = () => {
    return stage === 0 ? 0.2 : stage === 1 ? 0.5 : stage === 2 ? 0.8 : 0.3;
  };

  // Animação da esfera
  useFrame((state, delta) => {
    if (!sphereRef.current) return;
    
    const speed = getSpeed();
    // Rotação
    sphereRef.current.rotation.y += delta * speed;
    sphereRef.current.rotation.z += delta * speed * 0.3;
    
    // Escala pulsar baseada no estágio
    if (stage === 3) {
      // Efeito de conclusão: tamanho maior e pulsando
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1.1;
      sphereRef.current.scale.set(pulse, pulse, pulse);
    } else {
      // Efeito normal: pulsar leve
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.05 + 1;
      sphereRef.current.scale.set(pulse, pulse, pulse);
    }
    
    // Anima partículas ao redor se houver
    if (particlesRef.current) {
      particlesRef.current.rotation.y -= delta * speed * 0.5;
      particlesRef.current.rotation.x += delta * speed * 0.2;
    }
  });

  // Partículas ao redor da esfera
  const particlesMaterial = useMemo(() => {
    // Cores baseadas no estágio atual
    const color = new THREE.Color(colors[stage].glow);
    return new THREE.PointsMaterial({
      size: 0.1,
      color,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
  }, [stage, colors]);

  return (
    <group>
      {/* Esfera principal com material personalizado pelo estágio */}
      <Sphere ref={sphereRef} args={[1, 64, 64]}>
        <meshStandardMaterial
          color={colors[stage].main}
          emissive={colors[stage].glow}
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>

      {/* Partículas que orbitam a esfera */}
      <points ref={particlesRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <primitive object={particlesMaterial} />
      </points>
    </group>
  );
}
