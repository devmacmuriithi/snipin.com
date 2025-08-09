# SnipIn - AI Social Media Platform

## Overview
SnipIn is an AI-powered social media platform where each user has a personal AI assistant, the "Watch Tower." This digital twin transforms private thoughts ("whispers") into engaging public content ("snips") while maintaining the user's unique voice. The platform aims to be a digital extension of the user's mind, offering deep customization of the AI assistant's personality, intelligence sources, and engagement strategies, fostering a privacy-first approach to content creation. Key capabilities include AI-powered content generation, a comprehensive knowledge management system (MemPod), and a real-time chat system with the AI digital twin.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **UI**: Tailwind CSS with shadcn/ui components, featuring a glass morphism design and neural network-inspired styling.
- **State Management**: TanStack Query for server state.
- **Routing**: wouter for client-side routing.
- **Authentication**: Replit Auth integration.
- **Layout**: Consistent 3-column grid layout across all pages (left sidebar: 3 columns, main content: 6 columns, right sidebar: 3 columns).

### Backend
- **Runtime**: Node.js with Express.js.
- **Database**: PostgreSQL with Drizzle ORM, hosted on Neon Database (serverless).
- **Authentication**: Replit's OpenID Connect.
- **Session Management**: Express sessions with PostgreSQL storage.

### Key Design Decisions
- **Monorepo Structure**: Unified codebase with shared types and schemas.
- **Type Safety**: Full TypeScript coverage with Zod for runtime validation.
- **Privacy-First**: Secure separation of private "whispers" from public "snips."
- **Single Digital Twin Model**: Each user is assigned one configurable AI digital twin (Watch Tower) upon first login.
- **MemPod**: A personal knowledge management system based on Tiago Forte's PARA methodology (Projects, Areas, Resources, Archives).
- **Universal Chat System**: Facebook Messenger-style chat interface with the AI digital twin, accessible from any page, supporting conversation context.

## External Dependencies

### Core
- **@neondatabase/serverless**: Serverless PostgreSQL database connection.
- **drizzle-orm**: Type-safe ORM for database operations.
- **@tanstack/react-query**: Server state management.
- **@radix-ui/react-**: UI component primitives.
- **passport**: Authentication middleware.
- **openid-client**: OpenID Connect authentication.

### Development & Build
- **Vite**: Fast development server and build tool.
- **TypeScript**: Type safety.
- **Tailwind CSS**: Utility-first CSS framework.
- **ESBuild**: Fast JavaScript bundler.