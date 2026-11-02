// Paste your own Firebase settings below (SETUP.md, step 3).
// These values are not secret: the security rules in firestore.rules protect the data.
export const firebaseConfig = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  appId: "PASTE_APP_ID"
};

// The only Google account that can see and manage bookings.
// It must be the same address that is written in firestore.rules.
export const OWNER_EMAIL = "blushwithmokshamakeupstudio@gmail.com";

// Stays false until the PASTE_ values above are replaced.
export const isConfigured = Object.values(firebaseConfig).every((v) => !String(v).includes("PASTE"));
