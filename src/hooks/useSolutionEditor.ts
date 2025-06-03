
import { useState } from 'react'

// Hook básico para evitar erro 404
export const useSolutionEditor = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return {
    isLoading,
    error,
    setIsLoading,
    setError
  }
}

export default useSolutionEditor
