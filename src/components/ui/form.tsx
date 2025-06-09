
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Text } from "@/components/ui/text"
import { AlertCircle, CheckCircle, Info } from "lucide-react"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'floating' | 'modern';
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div 
        ref={ref} 
        className={cn(
          "space-y-2 group transition-all duration-200",
          variant === 'floating' && "relative",
          variant === 'modern' && "space-y-3 p-4 bg-surface-elevated rounded-xl border border-border-subtle hover:border-border-hover transition-colors",
          className
        )} 
        {...props} 
      />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    variant?: 'default' | 'modern' | 'floating';
    required?: boolean;
  }
>(({ className, variant = 'default', required, children, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(
        "transition-colors duration-200",
        variant === 'modern' && "font-semibold text-text-primary flex items-center gap-2",
        variant === 'floating' && "absolute left-3 top-2 text-sm text-text-secondary pointer-events-none transition-all duration-200 origin-left group-focus-within:transform group-focus-within:scale-75 group-focus-within:-translate-y-3 group-focus-within:translate-x-1",
        error && "text-error",
        className
      )}
      htmlFor={formItemId}
      {...props}
    >
      {children}
      {required && (
        <span className="text-error ml-1" aria-label="required">*</span>
      )}
      {variant === 'modern' && (
        <div className="ml-auto">
          {error ? (
            <AlertCircle className="h-4 w-4 text-error" />
          ) : (
            <CheckCircle className="h-4 w-4 text-success opacity-0 group-focus-within:opacity-100 transition-opacity" />
          )}
        </div>
      )}
    </Label>
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    variant?: 'default' | 'modern';
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <Text
      ref={ref}
      id={formDescriptionId}
      variant="caption"
      textColor="secondary"
      className={cn(
        "transition-colors duration-200",
        variant === 'modern' && "flex items-center gap-2 bg-info/5 p-3 rounded-lg border border-info/10",
        className
      )}
      {...props}
    >
      {variant === 'modern' && <Info className="h-4 w-4 text-info flex-shrink-0" />}
      {props.children}
    </Text>
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    variant?: 'default' | 'modern';
  }
>(({ className, variant = 'default', children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <Text
      ref={ref}
      id={formMessageId}
      variant="caption"
      textColor="error"
      className={cn(
        "animate-fade-in transition-all duration-200",
        variant === 'modern' && "flex items-center gap-2 bg-error/5 p-3 rounded-lg border border-error/10",
        className
      )}
      {...props}
    >
      {variant === 'modern' && <AlertCircle className="h-4 w-4 text-error flex-shrink-0" />}
      {body}
    </Text>
  )
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
