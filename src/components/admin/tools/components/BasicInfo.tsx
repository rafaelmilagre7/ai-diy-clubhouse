
import { UseFormReturn } from 'react-hook-form';
import { ToolFormValues } from '../types/toolFormTypes';
import { ToolNameInput } from './form/ToolNameInput';
import { LogoUpload } from './form/LogoUpload';
import { DescriptionInput } from './form/DescriptionInput';
import { CategorySelect } from './form/CategorySelect';
import { StatusToggle } from './form/StatusToggle';
import { OfficialUrlInput } from './form/OfficialUrlInput';

interface BasicInfoProps {
  form: UseFormReturn<ToolFormValues>;
}

export const BasicInfo = ({ form }: BasicInfoProps) => {
  return (
    <div className="grid gap-6">
      <ToolNameInput form={form} />
      <LogoUpload form={form} />
      <DescriptionInput form={form} />
      
      <div className="grid gap-4 sm:grid-cols-2">
        <CategorySelect form={form} />
        <StatusToggle form={form} />
      </div>
      
      <OfficialUrlInput form={form} />
    </div>
  );
};
