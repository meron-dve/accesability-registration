import { createContext, useContext } from 'react'

export const AccessContext = createContext({
  inShell: false,
  lang: 'en',
  simple: false,
  tr: (k) => k,
  openSupport: null,
})

export const useAccess = () => useContext(AccessContext)
