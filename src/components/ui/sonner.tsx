
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
          success: "bg-gradient-to-br from-emerald-500/90 to-green-600/90 border-emerald-400/30 shadow-emerald-500/20",
          error: "bg-gradient-to-br from-red-500/90 to-rose-600/90 border-red-400/30 shadow-red-500/20",
          info: "bg-gradient-to-br from-blue-500/90 to-cyan-600/90 border-blue-400/30 shadow-blue-500/20",
          warning: "bg-gradient-to-br from-amber-500/90 to-orange-600/90 border-amber-400/30 shadow-amber-500/20",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
