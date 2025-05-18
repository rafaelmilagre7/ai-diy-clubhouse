
import React from "react";
import { Button } from "@/components/ui/button";
import { Smile, BarChart, Youtube } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { YouTubeEmbed } from "./YouTubeEmbed";
import EmojiPicker from "emoji-picker-react";

interface EditorToolbarProps {
  onInsertEmoji: (emoji: string) => void;
  onInsertYouTube: (embedHtml: string) => void;
  onTogglePollCreator: () => void;
}

export function EditorToolbar({ 
  onInsertEmoji, 
  onInsertYouTube, 
  onTogglePollCreator 
}: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <EmojiPicker 
            onEmojiClick={(emojiData) => {
              onInsertEmoji(emojiData.emoji);
            }}
            width={300}
            height={400}
          />
        </PopoverContent>
      </Popover>

      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 px-2 text-xs"
        onClick={onTogglePollCreator}
      >
        <BarChart className="h-4 w-4 mr-1" />
        Enquete
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
            <Youtube className="h-4 w-4 mr-1" />
            YouTube
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <YouTubeEmbed onInsertEmbed={onInsertYouTube} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
