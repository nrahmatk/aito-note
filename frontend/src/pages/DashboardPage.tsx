import { type FormEvent, useDeferredValue, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2, LogOut, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { Navigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  apiRequest,
  getErrorMessage,
  removeToken,
  type User,
  type Note,
  type ApiCollection,
  type ApiResource,
  type NotePayload,
} from "@/lib/api"

interface DashboardPageProps {
  token: string | null
  onLogoutSuccess: () => void
}

export function DashboardPage({ token, onLogoutSuccess }: DashboardPageProps) {
  const queryClient = useQueryClient()

  const [noteDraft, setNoteDraft] = useState<NotePayload>({
    title: "",
    body: "",
  })
  const [noteModalMode, setNoteModalMode] = useState<"create" | "edit" | null>(
    null
  )
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null)
  const [copySourceId, setCopySourceId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search)

  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: () => apiRequest<User>("/user", {}, token),
    enabled: Boolean(token),
  })

  const notesQuery = useQuery({
    queryKey: ["notes"],
    queryFn: () => apiRequest<ApiCollection<Note>>("/notes", {}, token),
    enabled: Boolean(token),
  })

  const createNoteMutation = useMutation({
    mutationFn: (payload: NotePayload) =>
      apiRequest<ApiResource<Note>>(
        "/notes",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        token
      ),
    onSuccess: () => {
      setNoteDraft({ title: "", body: "" })
      setNoteModalMode(null)
      setActiveNoteId(null)
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    },
    onSettled: () => {
      setCopySourceId(null)
    },
  })

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: NotePayload }) =>
      apiRequest<ApiResource<Note>>(
        `/notes/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
        token
      ),
    onSuccess: () => {
      setActiveNoteId(null)
      setNoteDraft({ title: "", body: "" })
      setNoteModalMode(null)
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    },
  })

  const deleteNoteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest<void>(`/notes/${id}`, { method: "DELETE" }, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest<void>("/logout", { method: "POST" }, token),
    onSettled: () => {
      removeToken()
      queryClient.clear()
      onLogoutSuccess()
    },
  })

  if (!token) {
    return <Navigate to="/login" replace />
  }

  const notes = notesQuery.data?.data ?? []
  const searchTerm = deferredSearch.trim().toLowerCase()
  const filteredNotes = searchTerm
    ? notes.filter((note) =>
        `${note.title} ${note.body ?? ""}`.toLowerCase().includes(searchTerm)
      )
    : notes
  const isSubmittingNote =
    createNoteMutation.isPending || updateNoteMutation.isPending
  const noteMutationError = updateNoteMutation.error ?? createNoteMutation.error
  const deletingNoteId = deleteNoteMutation.isPending
    ? (deleteNoteMutation.variables ?? null)
    : null
  const copyingNoteId = createNoteMutation.isPending ? copySourceId : null

  function handleNoteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (noteModalMode === "edit" && activeNoteId !== null) {
      updateNoteMutation.mutate({
        id: activeNoteId,
        payload: {
          title: noteDraft.title,
          body: noteDraft.body || null,
        },
      })

      return
    }

    createNoteMutation.mutate({
      title: noteDraft.title,
      body: noteDraft.body || null,
    })
  }

  function openCreateModal() {
    setActiveNoteId(null)
    setNoteModalMode("create")
    setNoteDraft({ title: "", body: "" })
    createNoteMutation.reset()
    updateNoteMutation.reset()
  }

  function openEditModal(note: Note) {
    setActiveNoteId(note.id)
    setNoteModalMode("edit")
    setNoteDraft({ title: note.title, body: note.body ?? "" })
    createNoteMutation.reset()
    updateNoteMutation.reset()
  }

  function closeNoteModal() {
    setActiveNoteId(null)
    setNoteModalMode(null)
    setNoteDraft({ title: "", body: "" })
    createNoteMutation.reset()
    updateNoteMutation.reset()
  }

  function duplicateNote(note: Note) {
    setCopySourceId(note.id)
    createNoteMutation.mutate({
      title: `${note.title} (copy)`,
      body: note.body,
    })
  }

  return (
    <main className="min-h-svh bg-[#f4f1ea] p-4 text-[#28231c] sm:p-6">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-black/10 bg-white/80 p-5 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-[#7e7367] uppercase">
              aito-note
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tighter">
              Catatan Anda
            </h1>
            <p className="text-sm text-[#72685c]">
              {userQuery.data?.name ?? "Memuat user..."} ·{" "}
              {userQuery.data?.email}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={openCreateModal}
              className="h-[44px] cursor-pointer rounded-2xl bg-[#d4ff54] text-[#201b16] hover:bg-[#c4ef45]"
            >
              <Plus />
              Buat Catatan Baru
            </Button>
            <label className="relative min-w-0 flex-1 sm:w-80">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#817466]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-11 w-full rounded-2xl border border-black/10 bg-white pr-4 pl-11 text-sm ring-[#d4ff54]/50 outline-none focus:ring-4"
                placeholder="Cari catatan..."
              />
            </label>
            <Button
              size="icon"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="cursor-pointer rounded-2xl p-5 hover:bg-black/10"
              aria-label="Logout"
            >
              <LogOut />
            </Button>
          </div>
        </header>

        <section>
          {notesQuery.isLoading ? (
            <div className="flex min-h-80 items-center justify-center text-[#74685a]">
              <Loader2 className="mr-2 animate-spin" /> Memuat catatan
            </div>
          ) : notesQuery.error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700">
              {getErrorMessage(notesQuery.error)}
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-black/20 bg-white/70 p-10 text-center">
              <p className="text-lg font-bold">Tidak ada catatan ditemukan</p>
              <p className="mt-2 text-[#74685a]">
                Mulai dengan membuat catatan pertama Anda atau sesuaikan kata
                kunci pencarian.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredNotes.map((note) => (
                <article
                  key={note.id}
                  className={`rounded-3xl border border-black/10 bg-[#fffdf7] p-4 shadow-sm transition ${
                    deletingNoteId === note.id ? "opacity-60" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => openEditModal(note)}
                    className="w-full cursor-pointer text-left focus:outline-none"
                  >
                    <div className="flex w-full items-center justify-between">
                      <h3 className="truncate text-lg font-black tracking-[-0.03em]">
                        {note.title}
                      </h3>
                      <div>
                        <Pencil className="size-4 text-gray-400" />
                      </div>
                    </div>
                    <p
                      className="mt-3 min-h-18 text-sm leading-6 text-[#5e5145]"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {note.body || "Belum ada isi catatan."}
                    </p>
                  </button>

                  <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3">
                    <button
                      type="button"
                      onClick={() => duplicateNote(note)}
                      disabled={createNoteMutation.isPending}
                      className="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-semibold text-[#5e5145] transition hover:bg-black/5 disabled:opacity-50"
                    >
                      {copyingNoteId === note.id
                        ? "Menduplikasi..."
                        : "Buat salinan"}
                    </button>
                    <div className="flex gap-1">
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        onClick={(event) => {
                          event.stopPropagation()
                          deleteNoteMutation.mutate(note.id)
                        }}
                        disabled={deleteNoteMutation.isPending}
                        className={
                          deletingNoteId === note.id
                            ? "cursor-pointer bg-destructive/20 opacity-100"
                            : "cursor-pointer"
                        }
                        aria-label={`Delete ${note.title}`}
                      >
                        {deletingNoteId === note.id ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Trash2 />
                        )}
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {noteModalMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div
            className="absolute inset-0 cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={closeNoteModal}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                closeNoteModal()
              }
            }}
          />
          <section className="relative z-10 w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-5 shadow-2xl sm:p-6">
            <form onSubmit={handleNoteSubmit} className="grid gap-3">
              <h2 className="text-2xl font-black tracking-[-0.04em]">
                {noteModalMode === "edit" ? "Edit Catatan" : "Buat Catatan"}
              </h2>
              <input
                value={noteDraft.title}
                onChange={(event) =>
                  setNoteDraft({ ...noteDraft, title: event.target.value })
                }
                className="h-11 rounded-2xl border border-transparent bg-[#f6f2ec] px-4 font-semibold ring-[#d4ff54]/50 outline-none focus:border-black/10 focus:ring-4"
                placeholder="Judul"
                required
              />
              <textarea
                value={noteDraft.body ?? ""}
                onChange={(event) =>
                  setNoteDraft({ ...noteDraft, body: event.target.value })
                }
                className="min-h-36 rounded-2xl border border-transparent bg-[#f6f2ec] p-4 text-sm leading-6 ring-[#d4ff54]/50 outline-none focus:border-black/10 focus:ring-4"
                placeholder="Tulis catatan Anda di sini..."
              />
              {noteMutationError ? (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {getErrorMessage(noteMutationError)}
                </p>
              ) : null}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeNoteModal}
                  className="cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="cursor-pointer bg-[#d4ff54] text-[#201b16] hover:bg-[#c4ef45]"
                  disabled={isSubmittingNote}
                >
                  {isSubmittingNote ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Plus />
                  )}
                  {noteModalMode === "edit"
                    ? "Simpan Perubahan"
                    : "Tambah Catatan"}
                </Button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  )
}
