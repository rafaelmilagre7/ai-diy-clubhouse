import React from "react";
import { CompanyNameInput } from "./inputs/CompanyNameInput";
import { CompanySizeInput } from "./inputs/CompanySizeInput";
import { CompanySectorInput } from "./inputs/CompanySectorInput";
import { CompanyWebsiteInput } from "./inputs/CompanyWebsiteInput";
import { AnnualRevenueInput } from "./inputs/AnnualRevenueInput";
import { CurrentPositionSelectInput } from "./inputs/CurrentPositionSelectInput";

export const CompanyInputs = ({ control, errors }: any) => {
  return (
    <div className="space-y-5">
      <CompanyNameInput control={control} error={errors.company_name} />
      <CompanySizeInput control={control} error={errors.company_size} />
      <CompanySectorInput control={control} error={errors.company_sector} />
      <CompanyWebsiteInput control={control} error={errors.company_website} />
      <CurrentPositionSelectInput control={control} error={errors.current_position} />
      <AnnualRevenueInput control={control} error={errors.annual_revenue} />
    </div>
  );
};
