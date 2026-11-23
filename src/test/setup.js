import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { auth } from "../firebase";

vi.mock("../context/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("../firebase", () => ({
  auth: { currentUser: null },
  db: {},
  googleProvider: {},
}));
vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
}));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  auth.currentUser = null;
});
