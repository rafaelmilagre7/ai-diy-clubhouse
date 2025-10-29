import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LucideIcon, AlertCircle } from 'lucide-react';

interface Permission {
  key: string;
  label: string;
  description?: string;
  warning?: string;
}

interface PermissionCategoryProps {
  title: string;
  icon: LucideIcon;
  permissions: Permission[];
  selectedPermissions: Record<string, any>;
  onPermissionChange: (permission: string, checked: boolean) => void;
  disabled?: boolean;
}

export const PermissionCategory: React.FC<PermissionCategoryProps> = ({
  title,
  icon: Icon,
  permissions,
  selectedPermissions,
  onPermissionChange,
  disabled = false
}) => {
  return (
    <Card className="border-aurora-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="h-4 w-4 text-aurora-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {permissions.map((permission) => {
          const isChecked = !!selectedPermissions[permission.key];
          
          return (
            <div key={permission.key} className="space-y-2">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={permission.key}
                  checked={isChecked}
                  onCheckedChange={(checked) => onPermissionChange(permission.key, !!checked)}
                  disabled={disabled}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <Label 
                    htmlFor={permission.key} 
                    className="font-medium cursor-pointer text-sm"
                  >
                    {permission.label}
                  </Label>
                  {permission.description && (
                    <p className="text-xs text-muted-foreground">
                      {permission.description}
                    </p>
                  )}
                  {isChecked && permission.warning && (
                    <Alert variant="default" className="mt-2 py-2 px-3 bg-amber-500/10 border-amber-500/20">
                      <AlertCircle className="h-3 w-3 text-amber-500" />
                      <AlertDescription className="text-xs text-amber-600 dark:text-amber-400">
                        {permission.warning}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
