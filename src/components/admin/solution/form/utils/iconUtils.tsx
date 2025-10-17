
import React from "react";
import { 
  FileText, 
  File as FileIcon, 
  FileImage, 
  FileCode,
  FileSpreadsheet,
  Presentation,
  FileVideo
} from "lucide-react";

export const getFileIcon = (type?: string) => {
  const iconProps = { className: "h-6 w-6" };
  
  if (!type) return <FileIcon {...iconProps} />;
  
  switch(type) {
    case 'pdf':
      return <FileText className="text-severity-critical" {...iconProps} />;
    case 'document':
      return <FileText className="text-sky-500" {...iconProps} />;
    case 'spreadsheet':
      return <FileSpreadsheet className="text-operational" {...iconProps} />;
    case 'presentation':
      return <Presentation className="text-operational" {...iconProps} />;
    case 'image':
      return <FileImage className="text-strategy" {...iconProps} />;
    case 'video':
      return <FileVideo className="text-status-warning" {...iconProps} />;
    case 'template':
      return <FileCode {...iconProps} />;
    default:
      return <FileIcon {...iconProps} />;
  }
};
