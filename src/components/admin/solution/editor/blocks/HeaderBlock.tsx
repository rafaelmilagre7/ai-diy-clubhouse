
import React from "react";
import { Input } from "@/components/ui/input";

interface HeaderBlockProps {
  data: {
    text: string;
    level: number;
  };
  onChange: (data: any) => void;
}

const HeaderBlock: React.FC<HeaderBlockProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <select
          className="border rounded px-2 py-1 text-sm"
          value={data.level}
          onChange={(e) => onChange({ level: parseInt(e.target.value) })}
        >
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
          <option value="4">H4</option>
        </select>
        <Input
          value={data.text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Título"
        />
      </div>
    </div>
  );
};

export default HeaderBlock;
