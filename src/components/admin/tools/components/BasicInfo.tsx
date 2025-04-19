
import { FormField, FormItem } from "@/components/ui/form";
import { NameInput } from "./form/NameInput";
import { UrlInput } from "./form/UrlInput";
import { CategoryInput } from "./form/CategoryInput";
import { DescriptionInput } from "./form/DescriptionInput";
import { StatusToggle } from "./form/StatusToggle";
import { LogoUpload } from "./form/LogoUpload";

export const BasicInfo = ({ form }: any) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium border-b pb-2">Informações Básicas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NameInput form={form} />
        <UrlInput form={form} />
        <CategoryInput form={form} />
        <LogoUpload form={form} />
        <DescriptionInput form={form} />
        <StatusToggle form={form} />
      </div>
    </div>
  );
};
