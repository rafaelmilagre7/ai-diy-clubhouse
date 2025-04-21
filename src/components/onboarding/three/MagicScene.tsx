
import React from "react";
import { Canvas } from "@react-three/fiber";
import { MagicSphere } from "./MagicSphere";

interface MagicSceneProps {
  stage: number;
  onCanvasCreated?: () => void;
}

export function MagicScene({ stage, onCanvasCreated }: MagicSceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 7], fov: 60 }}
      onCreated={onCanvasCreated}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[2, 10, 5]} intensity={1.7} />
      <pointLight position={[-10, -10, -10]} intensity={1.1} />
      <MagicSphere stage={stage} />
    </Canvas>
  );
}
