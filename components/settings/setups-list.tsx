'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import { createSetup, updateSetup, deleteSetup } from '@/app/actions/settings'
import { Database } from '@/types/database'
import { toast } from 'sonner'

type Setup = Database['public']['Tables']['setups']['Row']

export function SetupsList({ setups }: { setups: Setup[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await createSetup(formData)
      toast.success('Setup added')
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
      await deleteSetup(id)
      toast.success('Setup deleted')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleUpdate = async (id: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await updateSetup(id, formData)
      setEditingId(null)
      toast.success('Setup updated')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Strategies & Setups</h2>
      <div className="rounded-md border border-zinc-800 bg-zinc-900">
        <div className="grid grid-cols-12 gap-4 border-b border-zinc-800 p-4 text-sm font-medium text-zinc-400">
          <div className="col-span-4">Name</div>
          <div className="col-span-6">Description</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {setups.map((setup) => (
          <div key={setup.id} className="grid grid-cols-12 gap-4 border-b border-zinc-800 p-4 last:border-0 items-center">
            {editingId === setup.id ? (
              <form id={`edit-${setup.id}`} onSubmit={(e) => handleUpdate(setup.id, e)} className="contents">
                <div className="col-span-4">
                  <input name="name" defaultValue={setup.name} className="w-full rounded bg-zinc-800 px-2 py-1 text-white" required />
                </div>
                <div className="col-span-6">
                  <input name="description" defaultValue={setup.description || ''} className="w-full rounded bg-zinc-800 px-2 py-1 text-white" />
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <button type="submit" className="text-green-500 hover:text-green-400"><Check className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-400"><X className="h-4 w-4" /></button>
                </div>
              </form>
            ) : (
              <>
                <div className="col-span-4 text-white font-medium">{setup.name}</div>
                <div className="col-span-6 text-zinc-400 truncate">{setup.description}</div>
                <div className="col-span-2 flex justify-end gap-2">
                  <button onClick={() => setEditingId(setup.id)} className="text-zinc-400 hover:text-white"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(setup.id)} className="text-zinc-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Add New */}
        <form onSubmit={handleAdd} className="grid grid-cols-12 gap-4 p-4 items-center bg-zinc-900/50">
          <div className="col-span-4">
             <input name="name" placeholder="Setup Name" className="w-full rounded bg-zinc-950 px-3 py-2 text-sm text-white border border-zinc-800 focus:border-white outline-none" required />
          </div>
          <div className="col-span-6">
             <input name="description" placeholder="Description (optional)" className="w-full rounded bg-zinc-950 px-3 py-2 text-sm text-white border border-zinc-800 focus:border-white outline-none" />
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
