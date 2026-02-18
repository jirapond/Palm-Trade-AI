# PalmTrack - Palm Oil Purchase Planning Application

## Overview

PalmTrack is a mobile-first web application designed for Thai palm oil farmers to find and compare palm oil factories in Surat Thani province. The app helps farmers locate nearby factories, compare purchase prices, view queue information, and schedule appointments for selling their palm oil harvest.

**Primary Features:**
- Factory discovery with location-based recommendations
- Interactive map view showing user location and all factories
- Price comparison across multiple factories
- Real-time queue status and operational hours
- In-app messaging with factories
- Appointment scheduling system
- Light/dark theme support

**Target Users:** Palm oil farmers in Thailand who need efficient tools for planning where to sell their harvest based on distance, price, and queue wait times.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight router)
- **State Management:** TanStack React Query for server state
- **Styling:** Tailwind CSS with CSS variables for theming
- **Component Library:** shadcn/ui (Radix UI primitives with custom styling)
- **Build Tool:** Vite with custom plugins for Replit integration

**Design System:** Material Design 3 principles adapted for Thai language support using Noto Sans Thai font. Mobile-first approach with bottom navigation pattern.

### Backend Architecture
- **Runtime:** Node.js with Express
- **Language:** TypeScript with ESM modules
- **API Pattern:** RESTful JSON API under `/api/*` routes
- **Development:** Vite middleware for HMR during development
- **Production:** Static file serving from `dist/public`

### Data Storage
- **ORM:** Drizzle ORM with PostgreSQL dialect
- **Schema Location:** `shared/schema.ts` (shared between client and server)
- **Current State:** In-memory storage with mock data for 20 Surat Thani factories
- **Database Ready:** PostgreSQL schema defined, requires `DATABASE_URL` environment variable

**Data Models:**
- Users (authentication)
- Factories (palm oil purchasing facilities)
- Messages (chat between farmers and factories)
- Appointments (scheduled deliveries)

### API Structure
- `GET /api/factories` - List all factories
- `GET /api/factories/recommendations` - Location-based sorted list (supports `nearest` and `highest_price` modes)
- `GET /api/factories/:id` - Single factory details
- `GET /api/messages/:factoryId` - Chat history
- `POST /api/messages` - Send message
- `GET /api/conversations` - List all conversations
- `POST /api/appointments` - Create appointment

### Key Design Decisions

**Monorepo Structure:** Single repository with `client/`, `server/`, and `shared/` directories. Shared schema ensures type safety across the stack.

**In-Memory Storage Pattern:** The `server/storage.ts` implements an `IStorage` interface that currently uses in-memory arrays but is designed for easy database migration.

**Location-Based Sorting:** The Haversine formula calculates distances between user coordinates and factory locations for the "nearest" recommendation mode.

**Thai Language First:** All user-facing text is in Thai, with proper font support and locale settings for Thai users.

## External Dependencies

### Database
- PostgreSQL (configured via `DATABASE_URL` environment variable)
- Drizzle Kit for migrations (`npm run db:push`)

### Frontend Libraries
- React Day Picker for calendar functionality
- Embla Carousel for image carousels
- Recharts for data visualization
- Vaul for drawer components

### Development Tools
- Replit-specific Vite plugins for development experience
- esbuild for production server bundling

### Session Management
- `connect-pg-simple` for PostgreSQL session storage (ready but not yet implemented)
- `express-session` for session handling

### Geolocation
- Browser Geolocation API for user location detection
- Fallback coordinates to Surat Thani center (9.1382, 99.3217)

### Map Integration
- Leaflet + React-Leaflet for interactive map display
- OpenStreetMap tile layer for map backgrounds
- Custom SVG markers for user location (blue) and factories (green/orange for selected)