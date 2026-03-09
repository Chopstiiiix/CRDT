# RoyalTrack 🎵

A minimalist dashboard for musicians to monitor all their PRO (Performing Rights Organization) accounts in one place.

## Supported PROs
- BMI
- ASCAP
- PRS for Music
- Songtrust
- SESAC
- SOCAN

## Tech Stack
- React 18 + Vite
- React Router v6
- Recharts (data visualization)
- Framer Motion (animations)
- Liquid Glass UI (custom CSS design system)

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

**Demo login:** any email + password (6+ chars)

## Project Structure

```
src/
├── App.jsx                  # Root app + routing
├── index.css                # Liquid Glass design system
├── context/
│   ├── AuthContext.jsx      # Auth state
│   └── PROContext.jsx       # PRO accounts state
├── components/
│   ├── Sidebar.jsx          # Navigation sidebar
│   └── UI.jsx               # Shared glass components
├── data/
│   └── mockData.js          # Mock PRO data generator
└── pages/
    ├── Login.jsx            # Login screen
    ├── Dashboard.jsx        # Overview dashboard
    ├── PRODashboard.jsx     # Per-PRO dashboard (3 tabs)
    ├── ConnectPRO.jsx       # Add new PRO account
    └── Settings.jsx         # User settings
```

## Roadmap / Next Steps

### Real API Integration
Each PRO has an API (or scraping endpoint). Replace `generateMockData()` in `PROContext.jsx` with real fetch calls:

```js
// Example: replace mock data with real API call
const addPRO = async (proId, accountId, credentials) => {
  const data = await fetchPROData(proId, credentials)
  save([...connectedPROs, { ...PRO_REGISTRY[proId], accountId, data }])
}
```

### Backend (Recommended)
- Node.js / Express or Next.js API routes
- Store PRO credentials encrypted (never in localStorage)
- Scheduled cron jobs to refresh royalty data
- PostgreSQL or Supabase for user data

### Mobile App
- React Native with Expo (shares all context/data logic)
- Same design tokens via StyleSheet

### Features to Add
- CSV/PDF statement export
- Email notifications for new payments
- Multi-currency conversion
- Works co-writer split visualization
- Sync licensing tracker
