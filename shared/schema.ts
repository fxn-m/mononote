import { z } from "zod";

export const noteSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  content: z.string().default(""),
  tags: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().default(""),
  tags: z.array(z.string()).default([]),
});

export type Note = z.infer<typeof noteSchema>;
export type InsertNote = z.infer<typeof insertNoteSchema>;
