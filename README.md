# FoodCare – React + Vite

A React + Vite conversion of the original FoodCare food-waste management project.

## Requirements
- Node.js 18+ (Node.js 20+ recommended)
- npm

## Run locally
1. Extract this folder.
2. Open the `FoodCare-React-Vite` folder in VS Code.
3. Open Terminal in that folder.
4. Run:

```bash
npm install
npm run dev
```

5. Open the Local URL printed by Vite (usually `http://localhost:5173`).

## Build for deployment

```bash
npm run build
npm run preview
```

Vite creates the production website in the `dist` folder. Vercel can detect Vite automatically. Use `npm run build` as the build command and `dist` as the output directory if asked.

## Modules
- Home: project introduction and role selection.
- User: signup/login, find available food by location, claim food, claim history.
- Owner/Donor: signup/login, post surplus food, donation dashboard, donation history, expiry alerts, mark claimed donations as distributed.

## Local Storage
The demo stores accounts, current login sessions, and donations in the browser's Local Storage. Data is local to that browser/device and is not shared between different users or devices. Passwords are stored in plain text for this classroom prototype only. Do not use real passwords or deploy this as a production authentication system. A real deployment needs a secure backend and password hashing.

## Notifications
The project displays demo email/SMS notification messages. It does not send real emails or SMS messages; that requires an email/SMS service and backend integration.
