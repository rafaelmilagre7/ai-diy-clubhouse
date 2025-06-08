
import React from "react";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";

interface ContentSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  variant?: "default" | "card" | "bordered";
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  title,
  description,
  children,
  className,
  headerActions,
  variant = "default"
}) => {
  const wrapperClass = cn(
    "space-y-6",
    {
      "bg-surface rounded-xl border border-border p-6": variant === "card",
      "border-t border-border-subtle pt-6": variant === "bordered",
    },
    className
  );

  return (
    <section className={wrapperClass}>
      {(title || description || headerActions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            {title && (
              <Text variant="subsection" textColor="primary" className="font-semibold">
                {title}
              </Text>
            )}
            {description && (
              <Text variant="body" textColor="secondary">
                {description}
              </Text>
            )}
          </div>
          
          {headerActions && (
            <div className="flex items-center gap-2">
              {headerActions}
            </div>
          )}
        </div>
      )}
      
      <div>{children}</div>
    </section>
  );
};
