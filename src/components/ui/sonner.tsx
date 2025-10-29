
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
            "group toast toast-liquid-glass rounded-2xl shadow-2xl border backdrop-blur-xl transition-all duration-300",
          description: "text-sm opacity-90 mt-1 text-white",
          actionButton:
            "bg-white/20 hover:bg-white/30 text-white border-none rounded-lg font-medium transition-all duration-300",
          cancelButton:
            "bg-white/10 hover:bg-white/20 text-white border-none rounded-lg transition-all duration-300",
          title: "font-semibold text-base text-white",
          success: "toast-aurora-success",
          error: "toast-aurora-error",
          info: "toast-aurora-info",
          warning: "toast-aurora-warning",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
