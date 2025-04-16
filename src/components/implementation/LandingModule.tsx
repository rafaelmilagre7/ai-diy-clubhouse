
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Module } from "@/lib/supabase";
import BlockPreview from "../admin/solution/editor/preview/BlockPreview";

interface LandingModuleProps {
  module?: Module;
  onComplete: () => void;
}

export const LandingModule = ({ module, onComplete }: LandingModuleProps) => {
  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Bem-vindo à implementação guiada</h1>
        <p className="text-muted-foreground mb-8">
          Esta experiência passo a passo vai te ajudar a implementar a solução completa em sua empresa.
        </p>
      </div>
      
      {module?.content?.blocks ? (
        <div className="prose prose-blue max-w-none">
          {module.content.blocks.map((block: any) => (
            <BlockPreview key={block.id} block={block} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-lg overflow-hidden">
            <img 
              src="https://placehold.co/1200x600/0ABAB5/FFFFFF.png?text=VISÃO+GERAL+DA+SOLUÇÃO&font=montserrat"
              alt="Visão geral" 
              className="w-full object-cover"
            />
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-8">
            <h3 className="text-xl font-bold text-blue-800 mb-3">O que você vai aprender</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Como configurar o ambiente ideal para implementação</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Passo a passo detalhado com exemplos práticos</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Como medir os resultados e otimizar a solução</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Dicas especiais para maximizar o ROI</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-indigo-800 mb-3">Case real: resultados impressionantes</h3>
            <p className="text-indigo-700 mb-4">
              Veja como a empresa ABC implementou esta solução e conseguiu reduzir custos operacionais em 32% em apenas 3 semanas.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-white p-4 rounded-md shadow-sm text-center">
                <p className="text-xl font-bold text-indigo-600">+45%</p>
                <p className="text-sm text-indigo-700">Produtividade</p>
              </div>
              <div className="bg-white p-4 rounded-md shadow-sm text-center">
                <p className="text-xl font-bold text-indigo-600">-32%</p>
                <p className="text-sm text-indigo-700">Custos operacionais</p>
              </div>
              <div className="bg-white p-4 rounded-md shadow-sm text-center">
                <p className="text-xl font-bold text-indigo-600">+28%</p>
                <p className="text-sm text-indigo-700">Satisfação da equipe</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-center mt-10">
        <Button
          onClick={onComplete}
          className="bg-viverblue hover:bg-viverblue/90 px-8 py-6 text-lg"
        >
          Começar Implementação
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
