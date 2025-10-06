# QuizMaster - Online Quiz Application

## Overview

QuizMaster is a full-stack web application for creating and taking interactive quizzes. The platform supports three question types: multiple choice (multiple answers), single choice (one answer), and text-based questions. Users can create quizzes with custom questions, take quizzes, and view their results with detailed scoring feedback.

The application follows a modern monorepo structure with a React frontend and Express backend, using PostgreSQL for data persistence and Drizzle ORM for database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite for fast development and optimized production builds
- **Routing:** Wouter for lightweight client-side routing
- **State Management:** TanStack Query (React Query) for server state management
- **Form Handling:** React Hook Form with Zod for validation
- **UI Components:** Shadcn UI (Radix UI primitives) with Tailwind CSS
- **Styling:** Tailwind CSS with custom design system based on Material Design principles

**Design System:**
- Implements "New York" style variant from Shadcn UI
- Supports light/dark mode with HSL color system
- Custom CSS variables for theming (primary, secondary, muted, destructive colors)
- Typography uses Inter font family for consistency
- Accessibility-first approach with high contrast and keyboard navigation

**Key Pages:**
- **Home:** Displays available quizzes with question counts and creation timestamps
- **Create Quiz:** Multi-step form for creating quizzes with various question types
- **Take Quiz:** Interactive quiz-taking interface with progress tracking
- **Results:** Score display with performance feedback and percentage calculation

**State Management Strategy:**
- Server state managed through React Query with custom queryClient configuration
- Optimistic updates disabled (staleTime: Infinity, refetchOnWindowFocus: false)
- Custom 401 handling behavior configured
- Local component state for UI interactions (form inputs, current question index, answers)

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL via Neon serverless
- **ORM:** Drizzle ORM for type-safe database queries
- **WebSocket:** Uses 'ws' library for Neon serverless connection

**API Design:**
- RESTful API endpoints under `/api` prefix
- JSON request/response format
- Zod schema validation for all incoming data
- Error handling middleware for consistent error responses

**Core Endpoints:**
- `POST /api/quizzes` - Create new quiz
- `GET /api/quizzes` - List all quizzes with question counts
- `GET /api/quizzes/:id` - Get specific quiz details
- `POST /api/quizzes/:id/questions` - Add question with options to quiz
- `GET /api/quizzes/:id/questions` - Get all questions for a quiz
- `POST /api/quizzes/:id/submit` - Submit quiz answers and calculate score

**Storage Layer:**
- Abstracted through IStorage interface for potential future storage implementations
- DatabaseStorage class implements all database operations
- Uses Drizzle ORM's query builder for type-safe SQL generation
- Cascade deletes configured for referential integrity

### Database Schema

**Tables:**
1. **quizzes**
   - `id`: UUID primary key (auto-generated)
   - `title`: Text, required
   - `createdAt`: Timestamp with default now()

2. **questions**
   - `id`: UUID primary key (auto-generated)
   - `quizId`: Foreign key to quizzes (cascade delete)
   - `text`: Question text, required
   - `type`: Enum (multiple_choice, single_choice, text_based)
   - `order`: Integer for question ordering
   - `correctTextAnswer`: Text for text-based questions (nullable)

3. **options**
   - `id`: UUID primary key (auto-generated)
   - `questionId`: Foreign key to questions (cascade delete)
   - `text`: Option text, required
   - `isCorrect`: Boolean flag for correct answers

**Relationships:**
- One quiz has many questions (one-to-many)
- One question has many options (one-to-many)
- Drizzle relations defined for type-safe joins

**Design Decisions:**
- UUID primary keys for distributed system compatibility
- Cascade deletes to maintain referential integrity
- Type safety enforced at both schema and TypeScript levels using drizzle-zod
- `order` field allows flexible question reordering without database migrations

### External Dependencies

**Database:**
- **Neon Serverless PostgreSQL:** Cloud-hosted PostgreSQL with WebSocket connection pooling
- Connection managed through `@neondatabase/serverless` package
- Pool-based connection management for scalability
- Requires `DATABASE_URL` environment variable

**Third-Party Libraries:**
- **Radix UI:** Comprehensive set of accessible UI primitives (dialogs, dropdowns, popovers, etc.)
- **TanStack Query:** Server state synchronization and caching
- **Zod:** Runtime type validation and schema definition
- **React Hook Form:** Form state management with validation
- **Drizzle ORM:** Type-safe database query builder and migration tool
- **Wouter:** Lightweight routing library
- **date-fns:** Date manipulation and formatting

**Development Tools:**
- **Vite:** Frontend build tool with HMR
- **TSX:** TypeScript execution for development server
- **esbuild:** Backend bundler for production
- **Replit Plugins:** Development banner, cartographer, and runtime error modal for Replit environment

**Build Configuration:**
- Monorepo structure with shared types between client and server
- Path aliases configured (@/, @shared/) for clean imports
- Separate build processes for client (Vite) and server (esbuild)
- Production build outputs to `dist/` directory