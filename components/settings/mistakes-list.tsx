'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import { createMistake, updateMistake, deleteMistake } from '@/app/actions/settings'
import { Database } from '@/types/database'
import { toast } from 'sonner'

type Mistake = Database['public']['Tables']['mistakes']['Row']

export function MistakesList({ mistakes }: { mistakes: Mistake[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await createMistake(formData)
      toast.success('Mistake added')
      e.currentTarget.reset()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return
    try {
      await deleteMistake(id)
      toast.success('Mistake deleted')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleUpdate = async (id: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await updateMistake(id, formData)
      setEditingId(null)
      toast.success('Mistake updated')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Mistakes Log</h2>
      <div className="rounded-md border border-zinc-800 bg-zinc-900">
        <div className="grid grid-cols-12 gap-4 border-b border-zinc-800 p-4 text-sm font-medium text-zinc-400">
          <div className="col-span-10">Name</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {mistakes.map((mistake) => (
          <div key={mistake.id} className="grid grid-cols-12 gap-4 border-b border-zinc-800 p-4 last:border-0 items-center">
            {editingId === mistake.id ? (
              <form id={`edit-${mistake.id}`} onSubmit={(e) => handleUpdate(mistake.id, e)} className="contents">
                <div className="col-span-10">
                  <input name="name" defaultValue={mistake.name} className="w-full rounded bg-zinc-800 px-2 py-1 text-white" required />
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <button type="submit" className="text-green-500 hover:text-green-400"><Check className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-400"><X className="h-4 w-4" /></button>
                </div>
              </form>
            ) : (
              <>
                <div className="col-span-10 text-white font-medium">{mistake.name}</div>
                <div className="col-span-2 flex justify-end gap-2">
                  <button onClick={() => setEditingId(mistake.id)} className="text-zinc-400 hover:text-white"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(mistake.id)} className="text-zinc-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Add New */}
        <form onSubmit={handleAdd} className="grid grid-cols-12 gap-4 p-4 items-center bg-zinc-900/50">
          <div className="col-span-10">
             <input name="name" placeholder="Mistake Name (e.g. FOMO)" className="w-full rounded bg-zinc-950 px-3 py-2 text-sm text-white border border-zinc-800 focus:border-white outline-none" required />
          </div>
          <div className="col-span-2 flex justify-end">
             <button type="submit" disabled={loading} className="flex items-center gap-2 rounded bg-white px-3 py-2 text-xs font-medium text-black hover:bg-zinc-200 disabled:opacity-50">
                <Plus className="h-3 w-3" /> Add
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}
