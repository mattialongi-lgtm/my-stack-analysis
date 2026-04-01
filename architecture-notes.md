# Architecture Notes

## Frontend
- Native app built with SwiftUI
- Runs on iOS/macOS
- Displays screenshot library, search, and chat interface

## Backend
- Node.js + Express server
- Handles:
  - file uploads
  - AI processing
  - communication with Supabase

## Database
- Supabase (PostgreSQL)
- Stores:
  - screenshot metadata
  - extracted text
  - AI summaries
  - embeddings (for search)

## AI Pipeline
1. Screenshot imported via PhotoKit
2. OCR performed locally using Apple Vision
3. Data optionally sent to Gemini API:
   - summarization
   - classification
   - embeddings
4. Results stored in Supabase

## Communication
- REST API (Express)
- WebSockets for real-time updates

## Storage
- Local device (images)
- Supabase (metadata + processed data)

## Authentication
- Likely handled via Supabase Auth (or local for now)

## Deployment
- Backend: Node.js server (local or cloud)
- Frontend: Native app (not web-hosted)