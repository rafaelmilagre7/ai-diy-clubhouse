
import React from "react";

interface ChecklistItem {
  text: string;
  checked: boolean;
}

interface ChecklistPreviewProps {
  data: {
    items: ChecklistItem[];
  };
}

const ChecklistPreview: React.FC<ChecklistPreviewProps> = ({ data }) => {
  return (
    <div className="my-4">
      <div className="space-y-2">
        {data.items.map((item, index) => (
          <div key={index} className="flex items-start">
            <div className={`w-5 h-5 border rounded flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center ${item.checked ? 'bg-primary border-primary text-primary-foreground' : 'border-border'}`}>
              {item.checked && (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </div>
            <span className={`${item.checked ? 'line-through text-muted-foreground' : ''}`}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChecklistPreview;
