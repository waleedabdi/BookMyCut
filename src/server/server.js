import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 1. Bulletproof way to find the JSON file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");

// 2. Load credentials from the environment or the local key file
let credential;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  credential = admin.credential.applicationDefault();
} else if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  credential = admin.credential.cert(serviceAccount);
}

if (!credential) {
  throw new Error("Firebase credentials not configured");
}

admin.initializeApp({ credential });

const auth = admin.auth();
const db = admin.firestore();

// 3. Setup Express
const app = express();
app.use(cors()); // Allow React to talk to Node
app.use(express.json());

const allSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

// 4. Middleware to check Auth
const checkAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    req.user = await auth.verifyIdToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// ==========================================
// 5. API ROUTES
// ==========================================

// Get Available Slots
app.get("/api/slots", async (req, res) => {
  const date = req.query.date;
  if (!date) return res.status(400).json({ error: "Date is required" });

  try {
    const snapshot = await db.collection("bookings").where("date", "==", date).get();
    const bookedTimes = snapshot.docs.map(doc => doc.data().time);
    const availableSlots = allSlots.filter(time => !bookedTimes.includes(time));
    res.json(availableSlots);
  } catch (error) {
    console.error("Failed to fetch slots:", error);
    res.status(500).json({ error: "Server error fetching slots" });
  }
});

// Book Appointment (Prevents Double Booking)
app.post("/api/book", checkAuth, async (req, res) => {
  const { serviceName, date, time } = req.body;
  if (!serviceName || !date || !time) {
    return res.status(400).json({ error: "Service, date, and time are required." });
  }
  if (!allSlots.includes(time)) {
    return res.status(400).json({ error: "Invalid booking time." });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "Invalid booking date." });
  }
  const bookingId = `${date}_${time}`;

  try {
    const docRef = db.collection("bookings").doc(bookingId);
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      if (doc.exists) {
        throw new Error("SLOT_TAKEN");
      }
      transaction.set(docRef, {
        userId: req.user.uid,
        userEmail: req.user.email,
        serviceName,
        date,
        time
      });
    });

    res.status(201).json({ message: "Booking successful!" });
  } catch (error) {
    if (error.message === "SLOT_TAKEN") {
      return res.status(400).json({ error: "This slot is already taken!" });
    }
    res.status(500).json({ error: "Server error creating booking" });
  }
});

// Get User Bookings
app.get("/api/my-bookings", checkAuth, async (req, res) => {
  try {
    const snapshot = await db.collection("bookings").where("userId", "==", req.user.uid).get();
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(bookings);
  } catch {
    res.status(500).json({ error: "Server error fetching bookings" });
  }
});

// Cancel Booking
app.delete("/api/bookings/:id", checkAuth, async (req, res) => {
  try {
    const docRef = db.collection("bookings").doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) return res.status(404).json({ error: "Booking not found" });
    if (doc.data().userId !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });

    await docRef.delete();
    res.json({ message: "Booking cancelled" });
  } catch {
    res.status(500).json({ error: "Server error cancelling booking" });
  }
});

// Owner Schedule
app.get("/api/owner/schedule", checkAuth, async (req, res) => {
  if (req.user.email !== "owner@bookmycut.com") {
    return res.status(403).json({ error: "Access denied. Owner only." });
  }

  const date = req.query.date;
  try {
    const snapshot = await db.collection("bookings").where("date", "==", date).get();
    const schedule = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    schedule.sort((a, b) => a.time.localeCompare(b.time));
    res.json(schedule);
  } catch {
    res.status(500).json({ error: "Server error fetching schedule" });
  }
});

// 6. Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});