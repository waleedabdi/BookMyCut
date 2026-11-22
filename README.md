# BookMyCut 

 

A modern salon and barbershop booking application built with React, Tailwind CSS, and Firebase. 

 

## Features 

- Secure Authentication (Email/Password & Google) 

- Real-time slot availability 

- Custom Node.js API to prevent double-booking 

- Integration with Kenya Public Holidays API 

- Owner dashboard for schedule management 

 

## 🛠️Tech Stack 

- Frontend: React, Vite, Tailwind CSS 

- Backend: Node.js, Express 
- Database: Firebase Firestore 

## Run locally

The frontend reads Firebase web configuration from `.env.local` using the
`VITE_FIREBASE_*` variables. The API reads the Firebase Admin credential from
`src/server/serviceAccountKey.json`; keep that service-account file private and
do not commit it.

Run `npm install` once, then start the frontend and API together with
`npm run dev`. The Vite development server proxies `/api` requests to the API
on port 5000.

 