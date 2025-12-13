# Portfolio CMS Admin Panel

A React-based admin panel for managing portfolio content.

## Tech Stack

- **React** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **React Router** for navigation
- **JWT** authentication

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```env
   VITE_API_BASE_URL=https://your-appwrite-function-url
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

## Features

- 🔐 JWT-based authentication
- 📊 Dashboard overview
- ✏️ CRUD for all content types:
  - Hero section
  - About page
  - Skills
  - Projects
  - Experience
  - Testimonials
  - Services
  - Social links
- 📧 View contact form submissions

## Folder Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React contexts (Auth)
├── hooks/          # Custom hooks
├── lib/            # API client, utilities
├── pages/          # Page components
└── App.tsx         # Main app with routing
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Base URL for Appwrite functions |
