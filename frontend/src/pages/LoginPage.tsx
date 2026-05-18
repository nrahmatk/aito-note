import { type FormEvent, startTransition, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useNavigate, Navigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  apiRequest,
  getErrorMessage,
  saveToken,
  getToken,
  type AuthResponse,
} from "@/lib/api"

interface LoginPageProps {
  onLoginSuccess: (token: string) => void
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [rememberMe, setRememberMe] = useState(false)
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  })

  const authMutation = useMutation({
    mutationFn: () =>
      apiRequest<AuthResponse>(`/${authMode}`, {
        method: "POST",
        body: JSON.stringify(
          authMode === "register"
            ? authForm
            : { email: authForm.email, password: authForm.password }
        ),
      }),
    onSuccess: (data) => {
      saveToken(data.token, rememberMe)
      queryClient.setQueryData(["user"], data.user)
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      onLoginSuccess(data.token)
      navigate("/")
    },
  })

  if (getToken()) {
    return <Navigate to="/" replace />
  }

  function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    authMutation.mutate()
  }

  function switchAuthMode(mode: "login" | "register") {
    startTransition(() => {
      setAuthMode(mode)
    })
  }

  return (
    <main className="min-h-svh overflow-hidden bg-[#f6f0e8] text-[#201b16]">
      <div className="mx-auto grid min-h-svh max-w-6xl grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative flex flex-col justify-center gap-10 border-black/10 p-8 lg:border-r lg:p-14">
          <div className="relative max-w-2xl">
            <p className="mb-5 inline-flex rounded-full border border-black/15 bg-white/45 px-4 py-2 text-xs font-semibold tracking-[0.24em] uppercase">
              ✨ Selamat Datang di aito-note
            </p>
            <h1 className="text-5xl leading-[0.92] font-black tracking-[-0.07em] sm:text-7xl">
              Simpan & Kelola Ide Terbaik Anda.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#5e5145]">
              Sebuah ruang aman dan terenkripsi untuk mengabadikan ide,
              merencanakan tugas harian, dan mengorganisir pemikiran Anda tanpa
              batas.
            </p>
          </div>
        </section>

        <section className="flex items-center p-6 sm:p-10">
          <div className="w-full rounded-[2rem] border border-black/10 bg-[#201b16] p-3 shadow-2xl shadow-black/20">
            <form
              onSubmit={handleAuthSubmit}
              className="rounded-[1.5rem] border border-white/10 bg-[#fffaf3] p-6 text-[#201b16]"
            >
              <div className="mb-6 flex rounded-full bg-[#eee3d4] p-1 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => switchAuthMode("login")}
                  className={`flex-1 cursor-pointer rounded-full px-4 py-2 transition ${
                    authMode === "login" ? "bg-[#201b16] text-white" : ""
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => switchAuthMode("register")}
                  className={`flex-1 cursor-pointer rounded-full px-4 py-2 transition ${
                    authMode === "register" ? "bg-[#201b16] text-white" : ""
                  }`}
                >
                  Register
                </button>
              </div>

              <div className="grid gap-4">
                {authMode === "register" ? (
                  <label className="grid gap-2 text-sm font-semibold">
                    Name
                    <input
                      value={authForm.name}
                      onChange={(event) =>
                        setAuthForm({ ...authForm, name: event.target.value })
                      }
                      className="h-12 rounded-2xl border border-black/10 bg-white px-4 ring-[#d4ff54]/60 outline-none focus:ring-4"
                      placeholder="Ada Lovelace"
                      required
                    />
                  </label>
                ) : null}

                <label className="grid gap-2 text-sm font-semibold">
                  Email
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(event) =>
                      setAuthForm({ ...authForm, email: event.target.value })
                    }
                    className="h-12 rounded-2xl border border-black/10 bg-white px-4 ring-[#d4ff54]/60 outline-none focus:ring-4"
                    placeholder="ada@example.com"
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold">
                  Password
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(event) =>
                      setAuthForm({
                        ...authForm,
                        password: event.target.value,
                      })
                    }
                    className="h-12 rounded-2xl border border-black/10 bg-white px-4 ring-[#d4ff54]/60 outline-none focus:ring-4"
                    placeholder="Minimum 8 characters"
                    required
                  />
                </label>

                {authMode === "login" && (
                  <label className="mt-1 flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-[#5e5145] transition-colors select-none hover:text-[#201b16]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="size-5 cursor-pointer rounded-lg border border-black/20 bg-white accent-[#201b16] outline-none focus:ring-2 focus:ring-[#d4ff54]/50"
                    />
                    <span>Ingat Saya</span>
                  </label>
                )}
              </div>

              {authMutation.error ? (
                <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {getErrorMessage(authMutation.error)}
                </p>
              ) : null}

              <Button
                type="submit"
                size="lg"
                className="mt-6 h-12 w-full rounded-2xl bg-[#d4ff54] text-[#201b16] hover:bg-[#c4ef45]"
                disabled={authMutation.isPending}
              >
                {authMutation.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : null}
                {authMode === "login" ? "Login" : "Create account"}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}
