
import React from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export const NPSSelector: React.FC<Props> = ({ value, onChange }) => (
  <div className="flex items-center justify-center gap-1 mt-2">
    {[...Array(11).keys()].map(n => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n.toString())}
        className={`rounded-full w-9 h-9 flex items-center justify-center border transition-all text-base font-semibold
          ${value === n.toString()
            ? 'bg-[#0ABAB5] text-white border-[#0ABAB5] scale-110 shadow'
            : 'bg-white text-gray-800 border-gray-300 hover:bg-[#0ABAB5]/20'
          }`}
        aria-label={`Nota ${n}`}
        style={{ transition: 'all 0.15s' }}
      >
        {n}
      </button>
    ))}
  </div>
);
