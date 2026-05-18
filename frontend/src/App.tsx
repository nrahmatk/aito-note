import { useState } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { LoginPage } from "@/pages/LoginPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { getToken } from "@/lib/api"

export function App() {
  const [token, setToken] = useState(() => getToken())

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <LoginPage onLoginSuccess={(newToken) => setToken(newToken)} />
          }
        />
        <Route
          path="/"
          element={
            <DashboardPage
              token={token}
              onLogoutSuccess={() => setToken(null)}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
