import { useEffect, useState } from 'react'

const STORAGE_KEY = 'formProposta.enforcePptxAvailability'
const DEFAULT_VALUE = true

function readStoredValue(): boolean {
  if (typeof window === 'undefined') return DEFAULT_VALUE
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw === null) return DEFAULT_VALUE
  return raw === 'true'
}

export function useEnforcePptxAvailability(): [boolean, (next: boolean) => void] {
  const [value, setValue] = useState<boolean>(() => readStoredValue())

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(value))
  }, [value])

  return [value, setValue]
}
