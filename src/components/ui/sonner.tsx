
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
            "group toast backdrop-blur-xl rounded-xl shadow-2xl border",
          description: "text-sm opacity-90 mt-1",
          actionButton:
            "bg-white/20 hover:bg-white/30 text-current border-none",
          cancelButton:
            "bg-white/10 hover:bg-white/20 text-current border-none",
          title: "font-semibold text-base",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
