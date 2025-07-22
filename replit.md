# Anime Streaming Platform

## Overview
A mobile-friendly anime streaming and download platform built with React and Express.js, featuring the AnimeKai scraper from consumet.ts for authentic anime data.

## Project Architecture
- **Frontend**: React with Vite, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Data Source**: AnimeKai scraper from consumet.ts library
- **Storage**: In-memory storage for session data
- **Routing**: Wouter for frontend routing
- **State Management**: TanStack Query for data fetching and caching

## Features
- Browse anime catalog with title information
- Search anime with real-time suggestions
- Select between subtitled (sub) or dubbed (dub) versions
- Choose from multiple video quality options (480p, 720p, 1080p)
- Download links functionality
- Mobile-optimized interface
- Genre-based browsing
- Recently added/updated anime sections

## Color Scheme
- Primary: #FF6B35 (vibrant orange)
- Secondary: #2E86AB (ocean blue)  
- Background: #1A1A1A (dark charcoal)
- Text: #FFFFFF (white)
- Accent: #F18F01 (golden orange)
- Cards: #2D2D2D (dark grey)

## User Preferences
- Mobile-first responsive design
- Clean card-based grid layout
- Large touch targets for mobile use
- Smooth animations and transitions

## Current Status
- Backend server running successfully on port 3001
- Frontend development server running on port 5000  
- AnimeKai scraper fully integrated and tested
- API endpoints validated with real anime data
- Search functionality returns authentic AnimeKai results

## Recent Changes
- Successfully integrated AnimeKai scraper from consumet.ts library
- Validated scraper returns 29+ anime results for search queries
- Backend API endpoints fully operational with authentic data
- Both frontend and backend servers running concurrently
- Date: 2025-01-22

## Technical Implementation Details
- AnimeKai base URL: https://animekai.to
- Scraper selectors: `.aitem` (primary anime cards)
- Successfully extracts: title, image, links, sub/dub counts
- Timeout handling: 10-30 seconds for external requests
- Error handling: Graceful fallbacks for failed requests