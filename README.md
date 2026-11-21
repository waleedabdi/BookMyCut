# BookMyCut

BookMyCut is a React/Vite appointment-booking app backed by Firebase Authentication and Cloud Firestore.

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Configure Firebase Admin credentials for the API. Create a service account in Firebase or Google Cloud, download its JSON key outside the repository, and set `GOOGLE_APPLICATION_CREDENTIALS` to its absolute path. The key must not be committed.

   ```sh
   export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/service-account.json"
   ```

   The project ID defaults to `bookmycut-e54f9`. Override it with `FIREBASE_PROJECT_ID` if using another Firebase project.

3. Start the API and web app together:

   ```sh
   npm run dev
   ```

   The API listens on port `5000` by default and Vite proxies `/api` requests to it. Set `PORT` to change it. Browser origins are restricted to the Vite development and preview origins by default; set `CORS_ORIGINS` to a comma-separated allowlist when needed.

   To start only the API:

   ```sh
   npm run server
   ```

## Checks

```sh
npm run build
npm run lint
```
