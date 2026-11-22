import cors from "cors";
import express from "express";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const serviceAccountPath = fileURLToPath(new URL("./serviceAccountKey.json", import.meta.url));
const adminApp = getApps()[0] ?? initializeApp({
  credential: process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? applicationDefault()
    : cert(JSON.parse(readFileSync(serviceAccountPath, "utf8"))),
});
const adminAuth = getAuth(adminApp);
const db = getFirestore(adminApp);
const bookings = db.collection("bookings");
const app = express();
const slots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
const ownerEmail = (process.env.OWNER_EMAIL || "owner@bookmycut.com").toLowerCase();

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

app.use(cors());
app.use(express.json());

function isValidDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return false;
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}

function requireDate(req, res, next) {
  if (!isValidDate(req.query.date)) {
    return next(new HttpError(400, "A valid date in YYYY-MM-DD format is required."));
  }
  return next();
}

async function authenticate(req, res, next) {
  const authorization = req.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return next(new HttpError(401, "Authentication is required."));

  try {
    req.user = await adminAuth.verifyIdToken(match[1]);
    return next();
  } catch {
    return next(new HttpError(401, "Your session is invalid or expired. Please sign in again."));
  }
}

function requireOwner(req, res, next) {
  if (req.user.email?.toLowerCase() !== ownerEmail) {
    return next(new HttpError(403, "Owner access is required."));
  }
  return next();
}

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.get("/api/slots", requireDate, async (req, res) => {
  const snapshot = await bookings.where("date", "==", req.query.date).get();
  const bookedTimes = new Set(snapshot.docs.map((booking) => booking.get("time")));
  res.json(slots.filter((time) => !bookedTimes.has(time)));
});

app.post("/api/book", authenticate, async (req, res) => {
  const { serviceName, date, time } = req.body ?? {};
  if (typeof serviceName !== "string" || !serviceName.trim()) {
    throw new HttpError(400, "A service must be selected.");
  }
  if (!isValidDate(date) || !slots.includes(time)) {
    throw new HttpError(400, "Choose a valid date and appointment time.");
  }

  const bookingId = `${date}_${time.replace(":", "-")}`;
  const bookingRef = bookings.doc(bookingId);
  await db.runTransaction(async (transaction) => {
    const existingBooking = await transaction.get(bookingRef);
    if (existingBooking.exists) {
      throw new HttpError(409, "That time is already booked. Please choose another slot.");
    }

    const existingBookingsForDate = await transaction.get(
      bookings.where("date", "==", date),
    );
    if (existingBookingsForDate.docs.some((booking) => booking.get("time") === time)) {
      throw new HttpError(409, "That time is already booked. Please choose another slot.");
    }

    transaction.create(bookingRef, {
      userId: req.user.uid,
      userEmail: req.user.email || "",
      serviceName: serviceName.trim(),
      date,
      time,
      createdAt: new Date().toISOString(),
    });
  });

  res.status(201).json({ id: bookingId });
});

app.get("/api/my-bookings", authenticate, async (req, res) => {
  const snapshot = await bookings.where("userId", "==", req.user.uid).get();
  const userBookings = snapshot.docs
    .map((booking) => ({ id: booking.id, ...booking.data() }))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  res.json(userBookings);
});

app.delete("/api/bookings/:id", authenticate, async (req, res) => {
  const bookingRef = bookings.doc(req.params.id);
  const booking = await bookingRef.get();
  if (!booking.exists) throw new HttpError(404, "Booking not found.");
  if (booking.get("userId") !== req.user.uid && req.user.email?.toLowerCase() !== ownerEmail) {
    throw new HttpError(403, "You cannot cancel this booking.");
  }

  await bookingRef.delete();
  res.json({ success: true });
});

app.get("/api/owner/schedule", authenticate, requireOwner, requireDate, async (req, res) => {
  const snapshot = await bookings.where("date", "==", req.query.date).get();
  const schedule = snapshot.docs
    .map((booking) => ({ id: booking.id, ...booking.data() }))
    .sort((a, b) => a.time.localeCompare(b.time));
  res.json(schedule);
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  return res.status(status).json({
    error: status >= 500 ? "The server could not complete the request." : error.message,
  });
});

const port = Number(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(`BookMyCut API listening on port ${port}`);
});
