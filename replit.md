# Monochrome ASCII/Dithered Note-Taking Application

## Overview

A brutalist, terminal-inspired note-taking application with a vintage aesthetic. This full-stack web app features a monochrome design language reminiscent of early Berkeley Graphics software, combining stark functionality with ASCII art elements. Users can create, edit, search, and organize notes with tags in a distraction-free, command-line-inspired interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for the UI layer
- **Vite** as the build tool and development server with HMR (Hot Module Replacement)
- **Wouter** for client-side routing (lightweight alternative to React Router)
- **TanStack Query (React Query)** for server state management, caching, and data synchronization

**Design System**
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom brutalist theme
- **JetBrains Mono** monospace font stack for terminal aesthetic
- Custom design tokens enforce strict monochrome palette (black #000000, white #FFFFFF, greys)
- Zero border radius on all components for sharp, brutalist edges
- All styling follows design guidelines in `design_guidelines.md`

**State Management Pattern**
- Server state managed via React Query with aggressive caching
- Local UI state uses React hooks (useState, useEffect)
- Form state handled through controlled components
- Toast notifications for user feedback

### Backend Architecture

**Server Framework**
- **Express.js** for HTTP server and API routing
- **Node.js** runtime with ES modules (type: "module")
- RESTful API design pattern

**API Structure**
- `GET /api/notes` - Fetch all notes or search with query parameter
- `GET /api/notes/:id` - Fetch single note by ID
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update existing note
- `DELETE /api/notes/:id` - Delete note

**Data Layer**
- **Drizzle ORM** for type-safe database operations
- **Zod** for runtime schema validation on API requests
- Shared schema definitions between client and server (`shared/schema.ts`)
- In-memory storage implementation (`MemStorage` class) for development with PostgreSQL-compatible interface

**Middleware Stack**
- JSON body parsing with raw body buffer access
- URL-encoded form data support
- Request/response logging middleware
- Vite development middleware integration

### Data Storage

**Database Schema**
The application uses a PostgreSQL database with the following structure:

**Notes Table**
- `id`: UUID primary key (auto-generated)
- `title`: Text field for note title (required)
- `content`: Text field for note body (default empty string)
- `tags`: Text array for categorization (default empty array)
- `createdAt`: Timestamp (auto-set on creation)
- `updatedAt`: Timestamp (auto-updated on modification)

**ORM Pattern**
- Drizzle provides type inference from schema to TypeScript types
- Schema validation via `drizzle-zod` for runtime safety
- Migrations stored in `/migrations` directory
- Database connection via Neon serverless driver for PostgreSQL

**Data Access Layer**
- Abstract `IStorage` interface defines contract for data operations
- `MemStorage` class implements interface for in-memory development
- Production implementation would swap to Drizzle-based PostgreSQL storage
- Methods include: getNotes, getNote, createNote, updateNote, deleteNote, searchNotes

### Development & Deployment

**Build Process**
- Client: Vite bundles React app to `dist/public`
- Server: esbuild bundles Express server to `dist/index.js`
- Single `npm run build` command produces production artifacts
- Development mode runs Vite dev server with Express API proxy

**Environment Configuration**
- `DATABASE_URL` environment variable required for PostgreSQL connection
- Development uses in-memory storage, production requires database provisioning
- Drizzle config validates DATABASE_URL presence

**Development Tools**
- TypeScript for full-stack type safety with shared types
- Path aliases configured: `@/` (client), `@shared/` (shared), `@assets/` (assets)
- Hot reload for both client and server in development
- Replit-specific plugins for error overlays and dev tooling

## External Dependencies

### Third-Party UI Libraries
- **Radix UI** - Headless component primitives (accordion, dialog, dropdown, popover, select, tooltip, etc.)
- **Lucide React** - Icon library for UI elements
- **class-variance-authority** - CVA utility for component variants
- **clsx & tailwind-merge** - Class name management utilities
- **cmdk** - Command palette interface component
- **embla-carousel-react** - Carousel/slider functionality
- **date-fns** - Date manipulation and formatting
- **vaul** - Drawer component library

### Backend Services
- **@neondatabase/serverless** - PostgreSQL serverless driver for Neon Database
- **connect-pg-simple** - PostgreSQL session store for Express (suggests session management capability)

### Build & Development Tools
- **Vite** with React plugin and TypeScript support
- **esbuild** for server-side bundling
- **Drizzle Kit** for database migrations and schema management
- **PostCSS** with Autoprefixer for CSS processing
- **Replit-specific plugins** - Runtime error modal, cartographer, dev banner

### Data Validation
- **Zod** - Runtime type validation and schema parsing
- **@hookform/resolvers** - Form validation resolver (suggests react-hook-form usage)