
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { MagicSphere } from "./MagicSphere";

interface MagicSceneProps {
  stage?: number;
  onCanvasCreated?: () => void;
  isAnimating?: boolean;
}

export function MagicScene({ 
  stage = 1, 
  onCanvasCreated, 
  isAnimating = false 
}: MagicSceneProps) {
  return (
    <Canvas 
      shadows 
      dpr={[1, 2]} 
      camera={{ position: [0, 0, 5], fov: 50 }}
      onCreated={() => {
        if (onCanvasCreated) {
          onCanvasCreated();
        }
      }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <MagicSphere stage={stage} isAnimating={isAnimating} />
        <Environment preset="city" />
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          rotateSpeed={0.5}
          autoRotate 
          autoRotateSpeed={0.5} 
        />
      </Suspense>
    </Canvas>
  );
}
