"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type FC,
  type ReactNode,
} from "react"

type AdminModeContextValue = {
  isAdmin: boolean
  toggleAdminMode: () => void
}

const AdminModeContext = createContext<AdminModeContextValue | null>(null)

export const AdminModeProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAdmin, setIsAdmin] = useState(false)
  const toggleAdminMode = useCallback(() => setIsAdmin((prev) => !prev), [])

  return (
    <AdminModeContext.Provider value={{ isAdmin, toggleAdminMode }}>
      {children}
    </AdminModeContext.Provider>
  )
}

export const useAdminMode = (): AdminModeContextValue => {
  const ctx = useContext(AdminModeContext)
  if (!ctx) {
    throw new Error("useAdminMode must be used within an AdminModeProvider")
  }
  return ctx
}
