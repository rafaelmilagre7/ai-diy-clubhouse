
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
      return <FileText {...iconProps} />;
    case 'document':
      return <FileText {...iconProps} />;
    case 'spreadsheet':
      return <FileSpreadsheet {...iconProps} />;
    case 'presentation':
      return <Presentation {...iconProps} />;
    case 'image':
      return <FileImage {...iconProps} />;
    case 'video':
      return <FileVideo {...iconProps} />;
    case 'template':
      return <FileCode {...iconProps} />;
    default:
      return <FileIcon {...iconProps} />;
  }
};
