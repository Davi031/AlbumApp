import { ListProvider } from "./context/ListContext"
import { AuthProvider } from "./context/AuthContext"
import React from "react"

export function Provider({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ListProvider>{children}</ListProvider>
        </AuthProvider>
    )
}