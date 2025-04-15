
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddResourceButtonProps {
  onClick: () => void;
  label?: string;
}

const AddResourceButton: React.FC<AddResourceButtonProps> = ({
  onClick,
  label = "Adicionar Material"
}) => {
  return (
    <Button onClick={onClick}>
      <Plus className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
};

export default AddResourceButton;
