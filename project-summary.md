# Project Summary — AI Screenshot Organizer

## Overview
AI Screenshot Organizer is a cross-platform application (iOS/macOS + web backend) that automatically organizes and analyzes screenshots using a hybrid AI pipeline.

The app detects screenshots from the user's photo library, extracts text using on-device OCR, and enhances understanding through cloud-based AI (Google Gemini).

## Target Users
- Students managing study materials
- Professionals saving receipts, chats, or documents
- Anyone overwhelmed by large screenshot collections

## Core Features
- Automatic screenshot detection and import (PhotoKit)
- OCR text extraction using Apple Vision (on-device)
- AI-powered summarization and classification (Gemini)
- Entity extraction (dates, URLs, amounts)
- Semantic search (search by meaning, not just keywords)
- AI chat over screenshots (RAG system)
- Sensitive content detection

## How It Works
1. Screenshots are detected and imported automatically
2. OCR extracts text locally on device
3. Optional AI processing via Gemini:
   - summary
   - classification
   - embeddings
4. Data is stored and indexed
5. Users can search or interact via chat interface

## Architecture Style
Hybrid architecture:
- Native frontend (SwiftUI app)
- Node.js backend for processing & APIs
- Supabase for storage and database
- Google AI for advanced reasoning

## Value Proposition
Transforms unstructured screenshots into searchable, structured knowledge.
