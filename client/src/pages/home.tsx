import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { storage } from "@/lib/storage";
import type { Note, InsertNote } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Plus,
  Search,
  Download,
  Moon,
  Sun,
  Save,
  Trash2,
  X,
  Tag as TagIcon,
  Menu,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"txt" | "md">("txt");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: debouncedSearch ? ["notes", { search: debouncedSearch }] : ["notes"],
    queryFn: async () => {
      if (debouncedSearch) {
        return await storage.searchNotes(debouncedSearch);
      }
      return await storage.getNotes();
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async (data: InsertNote) => {
      return await storage.createNote(data);
    },
    onSuccess: (newNote: Note) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setSelectedNote(newNote);
      toast({ description: "Note created successfully" });
      setHasUnsavedChanges(false);
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: InsertNote;
    }) => {
      const updatedNote = await storage.updateNote(id, data);
      if (!updatedNote) throw new Error("Note not found");
      return updatedNote;
    },
    onSuccess: (updatedNote: Note) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setSelectedNote(updatedNote);
      toast({ description: "Note saved successfully" });
      setHasUnsavedChanges(false);
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const deleted = await storage.deleteNote(id);
      if (!deleted) throw new Error("Note not found");
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast({ description: "Note deleted successfully" });
      clearEditor();
    },
  });

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((note) => {
      note.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  const filteredNotes = useMemo(() => {
    if (filterTag === "all") {
      return notes;
    }
    return notes.filter((note) => note.tags?.includes(filterTag));
  }, [notes, filterTag]);

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title ?? "");
      setContent(selectedNote.content ?? "");
      setTags(selectedNote.tags ?? []);
      setHasUnsavedChanges(false);
      if (isMobile) {
        setSidebarOpen(false);
      }
    }
  }, [selectedNote, isMobile]);

  useEffect(() => {
    const hasChanges =
      selectedNote &&
      (selectedNote.title !== title ||
        selectedNote.content !== content ||
        JSON.stringify(selectedNote.tags ?? []) !== JSON.stringify(tags ?? []));
    setHasUnsavedChanges(!!hasChanges);
  }, [title, content, tags, selectedNote]);

  const clearEditor = () => {
    setSelectedNote(null);
    setTitle("");
    setContent("");
    setTags([]);
    setTagInput("");
    setHasUnsavedChanges(false);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleNewNote = () => {
    clearEditor();
  };

  const handleSave = () => {
    if (!title?.trim()) {
      toast({
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }

    const noteData: InsertNote = {
      title: title?.trim() ?? "",
      content: content?.trim() ?? "",
      tags,
    };

    if (selectedNote) {
      updateNoteMutation.mutate({ id: selectedNote.id, data: noteData });
    } else {
      createNoteMutation.mutate(noteData);
    }
    
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleDelete = () => {
    if (selectedNote) {
      deleteNoteMutation.mutate(selectedNote.id);
    }
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput?.trim() ?? "";
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleExport = () => {
    if (!selectedNote) return;

    let content = "";
    let filename = "";

    if (exportFormat === "txt") {
      content = `${selectedNote.title}\n\n${selectedNote.content}\n\nTags: ${selectedNote.tags.join(", ")}`;
      filename = `${selectedNote.title.replace(/[^a-z0-9]/gi, "_")}.txt`;
    } else {
      content = `# ${selectedNote.title}\n\n${selectedNote.content}\n\n**Tags:** ${selectedNote.tags.join(", ")}`;
      filename = `${selectedNote.title.replace(/[^a-z0-9]/gi, "_")}.md`;
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportDialogOpen(false);
    toast({ description: "Note exported successfully" });
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-3 sm:p-4 border-b-2 border-border">
        <div className="mb-3 sm:mb-4">
          <pre className="text-[8px] sm:text-[10px] leading-[1.2] select-none font-bold">
{`███╗   ██╗ ██████╗ ████████╗███████╗
████╗  ██║██╔═══██╗╚══██╔══╝██╔════╝
██╔██╗ ██║██║   ██║   ██║   █████╗  
██║╚██╗██║██║   ██║   ██║   ██╔══╝  
██║ ╚████║╚██████╔╝   ██║   ███████╗
╚═╝  ╚═══╝ ╚═════╝    ╚═╝   ╚══════╝`}
          </pre>
        </div>

        <div className="relative mb-3 sm:mb-4">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-testid="input-search"
            type="search"
            placeholder="> SEARCH NOTES..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 border-2 font-mono text-sm h-10 sm:h-9"
          />
        </div>

        <Select value={filterTag} onValueChange={setFilterTag}>
          <SelectTrigger
            data-testid="select-filter-tag"
            className="border-2 font-mono text-sm h-10 sm:h-9"
          >
            <SelectValue placeholder="FILTER BY TAG" />
          </SelectTrigger>
          <SelectContent className="border-2">
            <SelectItem value="all">ALL TAGS</SelectItem>
            {allTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          data-testid="button-new-note"
          onClick={handleNewNote}
          className="w-full mt-3 sm:mt-4 border-2 h-10 sm:h-9"
          variant="default"
        >
          <Plus className="h-4 w-4 mr-2" />
          NEW NOTE
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground font-mono">
            LOADING...
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="p-4 text-center">
            <pre className="text-xs text-muted-foreground mb-2">
{`┌─────────────┐
│  NO NOTES   │
│   FOUND     │
└─────────────┘`}
            </pre>
            <p className="text-xs text-muted-foreground font-mono">
              {searchQuery || filterTag !== "all"
                ? "TRY DIFFERENT FILTERS"
                : "CREATE YOUR FIRST NOTE"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotes.map((note) => (
              <button
                key={note.id}
                data-testid={`note-item-${note.id}`}
                onClick={() => setSelectedNote(note)}
                className={`w-full text-left p-3 border-2 transition-colors hover-elevate active-elevate-2 min-h-[60px] ${
                  selectedNote?.id === note.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border"
                }`}
              >
                <h3
                  className="font-bold text-sm mb-1 truncate"
                  data-testid={`note-title-${note.id}`}
                >
                  {note.title}
                </h3>
                <p className="text-xs opacity-75 line-clamp-2 mb-2">
                  {note.content || "Empty note"}
                </p>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-[10px] px-1 py-0"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {note.tags.length > 3 && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1 py-0"
                      >
                        +{note.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-2 border-t-2 border-border flex gap-2">
        <Button
          data-testid="button-theme-toggle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          variant="outline"
          size="icon"
          className="border-2 h-10 w-10 sm:h-9 sm:w-9"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        <div className="flex-1 text-xs font-mono flex items-center justify-center border-2 border-border px-2">
          {notes.length} NOTE{notes.length !== 1 ? "S" : ""}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-80 border-r-2 border-border flex-col">
        <SidebarContent />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b-2 border-border p-3 sm:p-4">
          <div className="flex items-center gap-2 flex-wrap">
            {isMobile && (
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-2 h-10 w-10 sm:h-9 sm:w-9"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] sm:w-[320px] p-0 border-2">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            )}
            <Input
              data-testid="input-note-title"
              type="text"
              placeholder="NOTE TITLE..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 min-w-[120px] border-2 font-bold text-base sm:text-lg h-10 sm:h-9"
            />
            <div className="flex gap-2 flex-wrap">
              <Button
                data-testid="button-save-note"
                onClick={handleSave}
                disabled={
                  !title?.trim() ||
                  createNoteMutation.isPending ||
                  updateNoteMutation.isPending
                }
                className="border-2 h-10 sm:h-9"
                variant="default"
              >
                <Save className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">
                  {createNoteMutation.isPending || updateNoteMutation.isPending
                    ? "SAVING..."
                    : hasUnsavedChanges
                    ? "SAVE*"
                    : "SAVE"}
                </span>
              </Button>
              {selectedNote && (
                <>
                  <Button
                    data-testid="button-export-note"
                    onClick={() => setExportDialogOpen(true)}
                    variant="secondary"
                    className="border-2 h-10 sm:h-9"
                  >
                    <Download className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">EXPORT</span>
                  </Button>
                  <Button
                    data-testid="button-delete-note"
                    onClick={handleDelete}
                    disabled={deleteNoteMutation.isPending}
                    variant="destructive"
                    className="border-2 h-10 w-10 sm:h-9 sm:w-auto sm:px-4"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="border-b-2 border-border p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <TagIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-xs sm:text-sm font-mono font-bold">TAGS:</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags?.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="border-2 text-xs sm:text-sm pl-2 pr-1 py-1"
                data-testid={`tag-${tag}`}
              >
                {tag}
                <button
                  data-testid={`button-remove-tag-${tag}`}
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover-elevate active-elevate-2 min-w-[20px] min-h-[20px] flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              data-testid="input-add-tag"
              type="text"
              placeholder="ADD TAG..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 border-2 font-mono text-sm h-10 sm:h-9"
            />
            <Button
              data-testid="button-add-tag"
              onClick={handleAddTag}
              disabled={!tagInput?.trim()}
              variant="secondary"
              className="border-2 h-10 w-10 sm:h-9 sm:w-auto sm:px-4"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 p-3 sm:p-4 overflow-hidden">
          <Textarea
            data-testid="textarea-note-content"
            placeholder="START TYPING YOUR NOTE..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full border-2 font-mono text-sm resize-none"
          />
        </div>
      </div>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="border-2">
          <DialogHeader>
            <DialogTitle className="font-mono">EXPORT NOTE</DialogTitle>
            <DialogDescription className="font-mono text-xs">
              Choose the export format for your note
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="format" className="font-mono text-sm mb-2 block">
              FORMAT:
            </Label>
            <Select
              value={exportFormat}
              onValueChange={(value: "txt" | "md") => setExportFormat(value)}
            >
              <SelectTrigger
                id="format"
                data-testid="select-export-format"
                className="border-2 font-mono"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-2">
                <SelectItem value="txt">Plain Text (.txt)</SelectItem>
                <SelectItem value="md">Markdown (.md)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              data-testid="button-cancel-export"
              onClick={() => setExportDialogOpen(false)}
              variant="outline"
              className="border-2"
            >
              CANCEL
            </Button>
            <Button
              data-testid="button-confirm-export"
              onClick={handleExport}
              className="border-2"
            >
              <Download className="h-4 w-4 mr-2" />
              EXPORT
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
