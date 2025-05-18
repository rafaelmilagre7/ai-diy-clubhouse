
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PollCreatorProps {
  onInsertPoll: (pollHtml: string) => void;
  onCancel: () => void;
}

export function PollCreator({ onInsertPoll, onCancel }: PollCreatorProps) {
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  const addPollOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length <= 2) return; // Manter pelo menos 2 opções
    const newOptions = [...pollOptions];
    newOptions.splice(index, 1);
    setPollOptions(newOptions);
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const createPoll = () => {
    if (!pollQuestion.trim()) {
      return;
    }

    const validOptions = pollOptions.filter(option => option.trim() !== "");
    if (validOptions.length < 2) {
      return;
    }

    const pollHtml = `
      <div class="poll-container" data-poll-question="${pollQuestion}">
        <h3>${pollQuestion}</h3>
        <div class="poll-options">
          ${validOptions.map(option => `
            <div class="poll-option" data-option="${option}">
              <span>${option}</span>
              <div class="poll-progress" style="width: 0%"></div>
              <span class="poll-count">0 votos</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    onInsertPoll(pollHtml);
  };

  return (
    <div className="p-4 border-b">
      <h3 className="text-sm font-medium mb-2">Criar enquete</h3>
      <div className="space-y-3">
        <Input
          value={pollQuestion}
          onChange={(e) => setPollQuestion(e.target.value)}
          placeholder="Pergunta da enquete"
          className="mb-2"
        />
        
        {pollOptions.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={option}
              onChange={(e) => updatePollOption(index, e.target.value)}
              placeholder={`Opção ${index + 1}`}
              className="flex-1"
            />
            {index >= 2 && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => removePollOption(index)}
                className="h-8 w-8"
              >
                ✕
              </Button>
            )}
          </div>
        ))}
        
        <div className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addPollOption}
          >
            + Adicionar opção
          </Button>
          
          <div className="space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              size="sm" 
              onClick={createPoll}
              disabled={!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2}
            >
              Inserir enquete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
