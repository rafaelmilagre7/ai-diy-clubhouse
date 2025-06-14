

import * as React from "react"
import { ChartConfig, THEMES } from "./context"
import { SafeHtmlRenderer } from "@/components/security/SafeHtmlRenderer"

export const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  const styleContent = Object.entries(THEMES)
    .map(
      ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
    )
    .join("\n");

  return (
    <SafeHtmlRenderer
      html={`<style>${styleContent}</style>`}
      allowedTags={['style']}
      allowedAttributes={[]}
    />
  )
}

