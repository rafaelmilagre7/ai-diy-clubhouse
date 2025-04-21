
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Sparkles, Rocket, WandSparkles } from "lucide-react";

interface TrailMagicExperienceProps {
  onFinish: () => void;
  onStep?: (step: number) => void; // chamará quando avançar a etapa (para efeitos, etc)
}

const steps = [
  {
    title: "Preparando sua trilha personalizada...",
    description: "Analisando suas respostas de onboarding e combinando com soluções de IA do nosso ecossistema.",
    icon: <Sparkles className="mx-auto text-amber-500" size={44} />,
  },
  {
    title: "Encontrando as melhores soluções...",
    description: "Trabalhando para selecionar o que trará mais resultados para seu negócio.",
    icon: <Rocket className="mx-auto text-[#0ABAB5]" size={44} />,
  },
  {
    title: "Quase lá!",
    description: "Montando sua jornada perfeita de implementação de IA. Prepare-se!",
    icon: <WandSparkles className="mx-auto text-purple-500" size={44} />,
  },
  {
    title: "Sua trilha está pronta! 🚀",
    description: "Confira abaixo as soluções, justificativas e ação recomendada para seu perfil.",
    icon: <Sparkles className="mx-auto text-green-500 animate-bounce" size={44} />,
  },
];

// Elemento 3D simples e animado (esfera mágica com aura)
function MagicSphere({ stage }: { stage: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.6 * delta + 0.2 * (stage + 1);
      mesh.current.rotation.x += 0.1 * delta;
    }
  });
  
  return (
    <mesh ref={mesh} position={[0, 0, 0]} scale={1.2 + 0.2 * stage}>
      <sphereGeometry args={[1.5, 50, 50]} />
      <meshStandardMaterial
        color={
          stage === 0
            ? "#ffeab7"
            : stage === 1
            ? "#0ABAB5"
            : stage === 2
            ? "#b87ff5"
            : "#82e19b"
        }
        emissive={
          stage === 0
            ? "#ffd580"
            : stage === 1
            ? "#0ABAB5"
            : stage === 2
            ? "#9b87f599"
            : "#22bb77"
        }
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

export function TrailMagicExperience({ onFinish, onStep }: TrailMagicExperienceProps) {
  const [currStep, setCurrStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [canvasLoaded, setCanvasLoaded] = useState(false);

  // Efeito para iniciar animação ao montar o componente
  useEffect(() => {
    console.log("TrailMagicExperience montado");
    // Dar tempo para o componente montar antes de mostrar
    const timer = setTimeout(() => {
      setIsVisible(true);
      console.log("TrailMagicExperience agora é visível");
    }, 100);
    
    // Verificar se o Three.js está disponível
    if (typeof THREE !== 'undefined') {
      console.log("THREE está disponível no TrailMagicExperience", THREE.REVISION);
    } else {
      console.warn("THREE não está disponível no TrailMagicExperience!");
    }
    
    return () => clearTimeout(timer);
  }, []);

  // Modificado: Apenas avança com clique (sem timeout)
  const handleNext = () => {
    if (currStep < steps.length - 1) {
      setCurrStep((s) => {
        const next = s + 1;
        onStep && onStep(next);
        return next;
      });
    } else {
      onFinish();
    }
  };

  // Adicionar manipulador para Canvas carregada
  const handleCanvasCreated = () => {
    console.log("Canvas React Three Fiber carregada com sucesso");
    setCanvasLoaded(true);
  };

  if (!isVisible) {
    console.log("TrailMagicExperience não visível ainda");
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 animate-fade-in">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-2xl p-8 relative flex flex-col items-center animate-scale-in border-2 border-[#0ABAB5]/40">
        <div className="absolute top-2 right-3">
          {/* Só permite fechar depois do último passo */}
          {currStep === steps.length - 1 && (
            <Button variant="ghost" size="sm" onClick={onFinish} className="text-[#0ABAB5] font-medium">Ver Minha Trilha</Button>
          )}
        </div>
        <div className="w-full flex flex-col items-center">
          <div className="w-64 h-64 flex items-center justify-center mb-8 drop-shadow-lg">
            <Canvas 
              shadows 
              camera={{ position: [0, 0, 7], fov: 60 }}
              onCreated={handleCanvasCreated}
            >
              <ambientLight intensity={0.45} />
              <directionalLight position={[2, 10, 5]} intensity={1.7} />
              <pointLight position={[-10, -10, -10]} intensity={1.1} />
              <MagicSphere stage={currStep} />
            </Canvas>
          </div>
          <div className="w-full text-center mt-2 px-3">
            <div>{steps[currStep].icon}</div>
            <h2 className="text-2xl font-bold mt-2 text-[#0ABAB5]">{steps[currStep].title}</h2>
            <p className="mt-2 text-base text-gray-700">{steps[currStep].description}</p>
            <Button
              onClick={handleNext}
              className="mt-8 bg-[#0ABAB5] text-white text-lg px-6 py-2 rounded-full hover:bg-[#099d94] animate-fade-in"
            >
              {currStep < steps.length - 1
                ? currStep === 0
                  ? "Começar"
                  : "Avançar"
                : "Ver Minha Trilha"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
