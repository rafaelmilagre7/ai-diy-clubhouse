
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            "group toast toast-liquid-glass rounded-2xl shadow-2xl border backdrop-blur-xl",
          description: "text-sm opacity-90 mt-1 text-white",
          actionButton:
            "bg-white/20 hover:bg-white/30 text-white border-none rounded-lg font-medium",
          cancelButton:
            "bg-white/10 hover:bg-white/20 text-white border-none rounded-lg",
          title: "font-semibold text-base text-white",
          success: "gradient-success-solid border-emerald-400/30 shadow-lg shadow-emerald-500/20",
          error: "gradient-error-solid border-red-400/30 shadow-lg shadow-red-500/20",
          info: "gradient-info-solid border-blue-400/30 shadow-lg shadow-blue-500/20",
          warning: "gradient-warning-solid border-amber-400/30 shadow-lg shadow-amber-500/20",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
