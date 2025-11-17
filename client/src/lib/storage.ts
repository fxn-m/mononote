import { z } from "zod";
import type { Note, InsertNote } from "@shared/schema";

const STORAGE_KEY = "mononote_notes";

// LocalStorage-based storage implementation
export class LocalStorage {
  private getNotesFromStorage(): Note[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored) as Note[];
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return [];
    }
  }

  private saveNotesToStorage(notes: Note[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      throw new Error("Failed to save notes to localStorage");
    }
  }

  async getNotes(): Promise<Note[]> {
    const notes = this.getNotesFromStorage();
    return notes.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getNote(id: string): Promise<Note | undefined> {
    const notes = this.getNotesFromStorage();
    return notes.find((note) => note.id === id);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const notes = this.getNotesFromStorage();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const note: Note = {
      ...insertNote,
      id,
      createdAt: now,
      updatedAt: now,
    };
    notes.push(note);
    this.saveNotesToStorage(notes);
    return note;
  }

  async updateNote(id: string, insertNote: InsertNote): Promise<Note | undefined> {
    const notes = this.getNotesFromStorage();
    const index = notes.findIndex((note) => note.id === id);
    if (index === -1) {
      return undefined;
    }

    const updatedNote: Note = {
      ...notes[index],
      ...insertNote,
      id: notes[index].id,
      createdAt: notes[index].createdAt,
      updatedAt: new Date().toISOString(),
    };

    notes[index] = updatedNote;
    this.saveNotesToStorage(notes);
    return updatedNote;
  }

  async deleteNote(id: string): Promise<boolean> {
    const notes = this.getNotesFromStorage();
    const index = notes.findIndex((note) => note.id === id);
    if (index === -1) {
      return false;
    }
    notes.splice(index, 1);
    this.saveNotesToStorage(notes);
    return true;
  }

  async searchNotes(query: string): Promise<Note[]> {
    const notes = this.getNotesFromStorage();
    const lowerQuery = query.toLowerCase();
    return notes
      .filter(
        (note) =>
          note.title.toLowerCase().includes(lowerQuery) ||
          note.content.toLowerCase().includes(lowerQuery) ||
          note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      )
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }
}

export const storage = new LocalStorage();

