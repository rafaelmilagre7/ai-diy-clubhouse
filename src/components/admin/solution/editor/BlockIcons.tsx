
import React from "react";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  Image, 
  List, 
  Video, 
  Youtube,
  Type,
  PenTool,
  Eye 
} from "lucide-react";

export const ChevronDown = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("w-4 h-4", className)}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

export const ChevronUp = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("w-4 h-4", className)}>
    <path d="m18 15-6-6-6 6"/>
  </svg>
);

export const Code = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("w-4 h-4", className)}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

export const Quote = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("w-4 h-4", className)}>
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
  </svg>
);

export const getBlockIcon = (type: string) => {
  switch (type) {
    case 'header':
      return <Type className="h-4 w-4" />;
    case 'paragraph':
      return <FileText className="h-4 w-4" />;
    case 'image':
      return <Image className="h-4 w-4" />;
    case 'list':
      return <List className="h-4 w-4" />;
    case 'video':
      return <Video className="h-4 w-4" />;
    case 'youtube':
      return <Youtube className="h-4 w-4" />;
    case 'code':
      return <Code className="h-4 w-4" />;
    case 'quote':
      return <Quote className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};
