import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import Login from "../pages/Login";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { fillCredentials, renderPage } from "./testUtils";

describe("Login page", () => {
  beforeEach(() => {
    signInWithEmailAndPassword.mockReset();
    signInWithPopup.mockReset();
  });

  it("logs in and navigates to the home page", async () => {
    signInWithEmailAndPassword.mockResolvedValue({});
    renderPage(<Login />);
    fillCredentials();
    fireEvent.click(screen.getByText("Login"));
    await waitFor(() => expect(screen.getByTestId("current-path").textContent).toBe("/"));
  });

  it("shows the invalid credentials message", async () => {
    signInWithEmailAndPassword.mockRejectedValue({ code: "auth/invalid-credential" });
    vi.spyOn(console, "error").mockImplementation(() => {});
    renderPage(<Login />);
    fillCredentials();
    fireEvent.click(screen.getByText("Login"));
    expect((await screen.findByRole("alert")).textContent).toMatch(/Incorrect email or password/);
  });

  it("shows other email login errors", async () => {
    signInWithEmailAndPassword.mockRejectedValue(new Error("Login unavailable"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    renderPage(<Login />);
    fillCredentials();
    fireEvent.click(screen.getByText("Login"));
    expect((await screen.findByRole("alert")).textContent).toBe("Login unavailable");
  });

  it("supports Google sign-in and displays errors", async () => {
    signInWithPopup.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error("Google failed"));
    renderPage(<Login />);
    fireEvent.click(screen.getByText("Sign in with Google"));
    await waitFor(() => expect(screen.getByTestId("current-path").textContent).toBe("/"));
    cleanup();
    renderPage(<Login />);
    fireEvent.click(screen.getByText("Sign in with Google"));
    expect((await screen.findByRole("alert")).textContent).toBe("Google failed");
  });
});
