
import { UseFormReturn } from "react-hook-form";
import { type EventFormData } from "./EventFormSchema";
import { RecurrenceToggle } from "./recurrence/RecurrenceToggle";
import { RecurrencePattern } from "./recurrence/RecurrencePattern";
import { RecurrenceInterval } from "./recurrence/RecurrenceInterval";
import { RecurrenceWeekDay } from "./recurrence/RecurrenceWeekDay";
import { RecurrenceEndOptions } from "./recurrence/RecurrenceEndOptions";
import { RecurrenceSummary } from "./recurrence/RecurrenceSummary";
import { useRecurrence } from "./recurrence/useRecurrence";

interface EventRecurrenceProps {
  form: UseFormReturn<EventFormData>;
}

export const EventRecurrence = ({ form }: EventRecurrenceProps) => {
  const { isRecurring, pattern } = useRecurrence(form);

  return (
    <div className="space-y-6">
      <RecurrenceToggle form={form} />

      {isRecurring && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <RecurrencePattern form={form} />
            <RecurrenceInterval form={form} pattern={pattern} />
          </div>

          {pattern === "weekly" && (
            <RecurrenceWeekDay form={form} />
          )}

          <RecurrenceEndOptions form={form} />
          
          <RecurrenceSummary form={form} isRecurring={isRecurring} pattern={pattern} />
        </div>
      )}
    </div>
  );
};
