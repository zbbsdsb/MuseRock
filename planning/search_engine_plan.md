# MuseRock Search Engine: Development Plan

## 1. Overview
The MuseRock Search Engine (Asset Sourcing) aims to provide creators with factual grounding and inspiration materials directly within the writing workspace. It will move beyond "creative generation" into "research and sourcing."

## 2. Core Features (Milestones)

### Phase 1: Real-World Grounding
- **Gemini Search Grounding**: Update `AIService` to use Gemini's `built-in` search capabilities (Google Search Grounding).
- **Source Citations**: Ensure every piece of information provided has a verifiable link or source reference.
- **Deep Research Mode**: A toggle for "Surface Search" (quick facts) vs "Deep Archive" (academic, historical, and niche references).

### Phase 2: Asset Management
- **Pinning System**: Allow users to click a "Pin" button on any search result to save it to a sidebar "Mood Board."
- **Draft Context Sync**: The search engine should proactively suggest assets based on the *current cursor position* or the *last 500 words* written in the editor.
- **Reference Clipping**: Ability to select a snippet of search text and "Cite in Draft," which adds a footnote to the editor.

### Phase 3: Multi-modal Expansion
- **Image Sourcing**: Integration with Unsplash or Pexels for visual references.
- **Audio Scopes**: Sourcing ambient sounds or music references based on the "mood" of the text.
- **Data Visualizer**: Find raw data (CSV/JSON sources) and generate simple charts or logic tables for technical writing.

## 3. Technical Architecture

### Services
- `src/services/search.ts`: A dedicated service to handle API calls to search engines or Gemini Tool calls.
- `src/services/pinManager.ts`: LocalStorage or Firestore state management for "Pinned Assets."

### Components
- `ReferenceCard.tsx`: A specialized UI component for displaying different source types (Web, Academic, Visual).
- `SearchToolbar.tsx`: Advanced filters (File type, Date range, Domain restriction).

## 4. UI/UX Refinement (Editorial Design)
- **Overlay Previews**: Hover over a citation to see a small editorial-style card with a summary.
- **Split-View Synergy**: Drag-and-drop references from the Search panel directly into the Editor.
- **Minimalist Feedback**: Use progress bars that look like "loading ink" or "tracing paths" to maintain the aesthetic.

## 5. Security & API
- **Proxying**: If using external Search APIs, ensure keys are handled securely via the Settings panel.
- **Cache Management**: Cache frequent searches to reduce API quota consumption.
