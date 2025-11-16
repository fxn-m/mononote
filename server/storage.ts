import { type Note, type InsertNote } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getNotes(): Promise<Note[]>;
  getNote(id: string): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: string, note: InsertNote): Promise<Note | undefined>;
  deleteNote(id: string): Promise<boolean>;
  searchNotes(query: string): Promise<Note[]>;
}

export class MemStorage implements IStorage {
  private notes: Map<string, Note>;

  constructor() {
    this.notes = new Map();
  }

  async getNotes(): Promise<Note[]> {
    return Array.from(this.notes.values()).sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getNote(id: string): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const note: Note = {
      ...insertNote,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(
    id: string,
    insertNote: InsertNote
  ): Promise<Note | undefined> {
    const existingNote = this.notes.get(id);
    if (!existingNote) {
      return undefined;
    }

    const updatedNote: Note = {
      ...existingNote,
      ...insertNote,
      id: existingNote.id,
      createdAt: existingNote.createdAt,
      updatedAt: new Date().toISOString(),
    };

    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: string): Promise<boolean> {
    return this.notes.delete(id);
  }

  async searchNotes(query: string): Promise<Note[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.notes.values())
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

export const storage = new MemStorage();
