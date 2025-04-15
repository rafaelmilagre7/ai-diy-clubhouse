
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
      return <FileText className="text-red-500" {...iconProps} />;
    case 'document':
      return <FileText className="text-sky-500" {...iconProps} />;
    case 'spreadsheet':
      return <FileSpreadsheet className="text-green-500" {...iconProps} />;
    case 'presentation':
      return <Presentation className="text-blue-500" {...iconProps} />;
    case 'image':
      return <FileImage className="text-purple-500" {...iconProps} />;
    case 'video':
      return <FileVideo className="text-orange-500" {...iconProps} />;
    case 'template':
      return <FileCode {...iconProps} />;
    default:
      return <FileIcon {...iconProps} />;
  }
};
