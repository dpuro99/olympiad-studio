# 01 - System Architecture & Tech Stack Rules

## Project Definition
You are assisting with **Olympiad Studio**, a registry-driven React application serving as a workspace platform for Science Olympiad teams. Adhere strictly to the architectural constraints, file structure, and quality standards defined below.

## Core Tech Stack
- **Frontend Framework:** React (Vite-powered SPA, no routing library).
- **Backend-as-a-Service:** Supabase (Client-side JS SDK).

## Directory & Architecture Map
Follow the current module boundaries exactly when modifying or adding functionality:
- `src/App.jsx` - App controller managing global state (Theme, Current View/Event/Module).
- `src/supabaseClient.js` - Global Supabase browser client setup.
- `src/components/events/registry.js` - The central source of truth for modular features.
- `src/components/events/[event-name]/` - Event-specific engineering tools, visualizers, and loggers.
- `src/components/general/` - Shell infrastructure (`Home.jsx`, `LandingHome.jsx`, `ComingSoon.jsx`).

## Core Architectural Constraints

### Registry-Driven Architecture
- **NEVER** hardcode new modules directly into the dashboard layouts (`Home.jsx` or `App.jsx`).
- All tools must be registered inside `src/components/events/registry.js` using the standard data schema:
  ```js
  { 
    id: 'module-id', 
    ti: 'ti-icon-name', 
    label: 'Module Name', 
    cat: 'CategoryName', 
    live: true, 
    component: ComponentReference, 
    desc: 'Description string.' 
  }
  ```
- Unfinished features must have `live: false` or point directly to the shared `ComingSoon` component.

### State & Navigation
- The app functions entirely as a single-page layout driven by local React state. Do not install or introduce a routing engine unless explicitly instructed.
