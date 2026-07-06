"use client";

import { useState } from "react";
import { format } from "date-fns";
import { hr } from "date-fns/locale";
import { Plus, Pencil, Trash2, Check, X, StickyNote, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useCustomerNotes,
  useAddCustomerNote,
  useUpdateCustomerNote,
  useDeleteCustomerNote,
} from "@/app/api/hooks/customers/useCustomerNotes";

type Props = {
  open: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
};

export function CustomerNotesModal({ open, onClose, customerId, customerName }: Props) {
  const { data: notes = [], isLoading } = useCustomerNotes(open ? customerId : null);
  const addNote = useAddCustomerNote(customerId);
  const updateNote = useUpdateCustomerNote(customerId);
  const deleteNote = useDeleteCustomerNote(customerId);

  const [newContent, setNewContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  function startEdit(id: string, content: string) {
    setEditingId(id);
    setEditContent(content);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditContent("");
  }

  async function handleAdd() {
    if (!newContent.trim()) return;
    await addNote.mutateAsync(newContent.trim());
    setNewContent("");
  }

  async function handleUpdate(noteId: string) {
    if (!editContent.trim()) return;
    await updateNote.mutateAsync({ noteId, content: editContent.trim() });
    cancelEdit();
  }

  async function handleDelete(noteId: string) {
    await deleteNote.mutateAsync(noteId);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-primary" />
            Bilješke — {customerName}
          </DialogTitle>
        </DialogHeader>

        {/* Add new note */}
        <div className="space-y-2 border-b pb-4">
          <Textarea
            placeholder="Upiši bilješku (vrsta šišanja, alergije, preferencije...)"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={3}
            className="resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAdd();
            }}
          />
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!newContent.trim() || addNote.isPending}
            className="w-full sm:w-auto"
          >
            {addNote.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
            ) : (
              <Plus className="h-3.5 w-3.5 mr-1" />
            )}
            Dodaj bilješku
          </Button>
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto space-y-3 py-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Učitavanje...
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <StickyNote className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">Nema bilješki za ovog klijenta.</p>
              <p className="text-xs mt-1">Dodaj prvu bilješku gore.</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="rounded-lg border bg-card p-3 space-y-2 group"
              >
                {editingId === note.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="resize-none text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleUpdate(note.id);
                        if (e.key === "Escape") cancelEdit();
                      }}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(note.id)}
                        disabled={!editContent.trim() || updateNote.isPending}
                      >
                        {updateNote.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        ) : (
                          <Check className="h-3.5 w-3.5 mr-1" />
                        )}
                        Spremi
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="h-3.5 w-3.5 mr-1" />
                        Odustani
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{note.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">
                        {note.createdByName && (
                          <span className="font-medium">{note.createdByName} · </span>
                        )}
                        {format(new Date(note.createdAt), "dd.MM.yyyy. HH:mm", { locale: hr })}
                        {note.updatedAt && (
                          <span className="ml-1 italic">(izmijenjeno)</span>
                        )}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => startEdit(note.id, note.content)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(note.id)}
                          disabled={deleteNote.isPending}
                        >
                          {deleteNote.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
