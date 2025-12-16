# Portfolio CMS

Admin dashboard for managing portfolio content with live preview.

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Appwrite Auth** for authentication
- **Appwrite Storage** for image uploads

## Features

- 🔐 Appwrite Auth-based login (requires `admin` label)
- 📊 Dashboard overview
- ✏️ Visual editors with live preview
- 🖼️ Image upload to Appwrite Storage
- 📧 View contact form submissions

## Sections

| Section | Collection | Description |
|---------|------------|-------------|
| Hero | `hero` | Landing section content |
| About | `about` | About section with image |
| Skills | `skills` | Tech and Art skills |
| Projects | `projects` | Portfolio work with images |
| Experience | `experience` | Work history timeline |
| Services | `services` | Offered services |
| Social Links | `social_links` | Social profile links |
| Messages | `messages` | Contact form submissions |

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` file:
   ```env
   VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=<project-id>
   VITE_DATABASE_ID=portfolio_cms
   VITE_FUNCTION_CRUD_CONTENT=crud-content
   ```

3. Run dev server:
   ```bash
   npm run dev
   ```

## Folder Structure

```
src/
├── components/
│   ├── DashboardLayout.tsx   # Main layout wrapper
│   ├── EditorLayout.tsx      # Editor + Preview layout
│   ├── ImageUpload.tsx       # Drag-drop image upload
│   └── preview/              # Live preview components
├── context/
│   └── AuthContext.tsx       # Authentication context
├── lib/
│   ├── api.ts                # CRUD API service
│   ├── appwrite.ts           # Appwrite SDK setup
│   └── storage.ts            # Image upload utilities
├── pages/
│   ├── Dashboard.tsx         # Overview dashboard
│   ├── Login.tsx             # Login page
│   └── editors/              # Content editors
└── App.tsx                   # Routing and layout
```

## Authentication

1. User logs in with Appwrite credentials
2. Must have `admin` label in Appwrite Console
3. Session persisted via Appwrite Auth
4. All CRUD operations go through `crud-content` function
