
import React from "react";

interface CTAPreviewProps {
  data: {
    title: string;
    text: string;
    buttonText: string;
    buttonLink: string;
  };
}

const CTAPreview: React.FC<CTAPreviewProps> = ({ data }) => {
  return (
    <div className="my-6 p-6 border border-blue-200 bg-blue-50 rounded-lg text-center">
      <h3 className="font-bold text-blue-800 text-xl">{data.title}</h3>
      
      {data.text && (
        <p className="mt-2 mb-4 text-blue-700 max-w-lg mx-auto">{data.text}</p>
      )}
      
      <button className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors">
        {data.buttonText}
      </button>
    </div>
  );
};

export default CTAPreview;
