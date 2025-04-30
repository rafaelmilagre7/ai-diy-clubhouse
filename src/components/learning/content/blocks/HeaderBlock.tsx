
import React from "react";
import { HeaderBlockData } from "@/components/admin/solution/editor/BlockTypes";

interface HeaderBlockProps {
  data: HeaderBlockData;
}

export const HeaderBlock: React.FC<HeaderBlockProps> = ({ data }) => {
  const { text, level } = data;
  
  switch (level) {
    case 1:
      return <h1 className="text-3xl font-bold mt-6 mb-4">{text}</h1>;
    case 2:
      return <h2 className="text-2xl font-bold mt-5 mb-3">{text}</h2>;
    case 3:
      return <h3 className="text-xl font-semibold mt-4 mb-2">{text}</h3>;
    case 4:
      return <h4 className="text-lg font-semibold mt-3 mb-2">{text}</h4>;
    case 5:
      return <h5 className="text-base font-semibold mt-3 mb-1">{text}</h5>;
    case 6:
      return <h6 className="text-sm font-semibold mt-2 mb-1">{text}</h6>;
    default:
      return <h3 className="text-xl font-semibold mt-4 mb-2">{text}</h3>;
  }
};
