
import React from "react";
import { CompanyNameInput } from "./inputs/CompanyNameInput";
import { CompanySizeInput } from "./inputs/CompanySizeInput";
import { CompanySectorInput } from "./inputs/CompanySectorInput";
import { CompanyWebsiteInput } from "./inputs/CompanyWebsiteInput";
import { CurrentPositionInput } from "./inputs/CurrentPositionInput";
import { AnnualRevenueInput } from "./inputs/AnnualRevenueInput";
import { Control, FieldErrors } from "react-hook-form";

interface CompanyInputsProps {
  control: Control<any>;
  errors: FieldErrors<any>;
  watch?: (name?: string) => any;
}

export const CompanyInputs: React.FC<CompanyInputsProps> = ({
  control,
  errors,
  watch,
}) => {
  return (
    <div className="flex flex-col gap-5">
      <CompanyNameInput 
        control={control}
        error={errors.company_name} 
      />
      <CompanySizeInput 
        control={control}
        error={errors.company_size}
      />
      <CompanySectorInput 
        control={control}
        error={errors.company_sector}
      />
      <CompanyWebsiteInput 
        control={control}
        error={errors.company_website} 
      />
      <CurrentPositionInput 
        control={control}
        error={errors.current_position}
      />
      <AnnualRevenueInput 
        control={control}
        error={errors.annual_revenue}
      />
    </div>
  );
};
