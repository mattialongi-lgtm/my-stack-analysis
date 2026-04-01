# Migration Planner Implementation Plan (Revised)

## Objective
Comparison of a high-performance stack using Supabase & Gemini against a unified Google Cloud / Firebase ecosystem.

## 1. Technical Stack Details
### Stack A: Current (Supabase & Gemini)
- **Frontend**: React + Vite
- **Backend API**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini (API)
- **Auth/Storage**: Supabase Managed

### Stack B: Alternative (Firebase & Cloud Run)
- **Frontend**: Firebase Hosting
- **Backend API**: Google Cloud Run (Containerized Node/Express)
- **Database**: Firestore (NoSQL)
- **AI**: Vertex AI (GCP Gemini)
- **Auth/Storage**: Firebase Managed

## 2. UI/UX Structure (index.html)
- **Global Toggle**: Switch between View A and View B.
- **Header**: Project Overview and Stack Titles.
- **Module 1: Architecture**: Interactive block diagram showing data flow from User -> FE -> BE -> DB/AI.
- **Module 2: Classification**: Comparison table for IaaS/PaaS/BaaS/SaaS labels.
- **Module 3: Costing**: Dynamic calculator with presets for 100, 1,000, and 10,000 users.
- **Module 4: Migration Path**: Step-by-step breakdown of rewrite requirements (SQL to NoSQL, SDK swaps).
- **Module 5: Analysis**: Lock-in and Risk matrix.

## 3. Design Aesthetics (style.css)
- **Theme**: Dark mode "Cyber-Industrial" (Slate, Emerald for Supabase, Amber for Firebase).
- **Typography**: Inter / Roboto.
- **Components**: Glassmorphism cards, animated bars for cost, hover-active diagrams.

## 4. Logic (script.js)
- State management for the toggle and user volume.
- Dynamic DOM manipulation for all values and descriptions.
- Cost calculation engine based on realistic April 2024 pricing.
