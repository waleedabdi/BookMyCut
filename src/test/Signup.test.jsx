import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import Signup from "../pages/Signup";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { fillCredentials, renderPage } from "./testUtils";

describe("Signup page", () => {
  beforeEach(() => {
    createUserWithEmailAndPassword.mockReset();
    signInWithPopup.mockReset();
  });

  it("rejects passwords shorter than six characters", () => {
    renderPage(<Signup />);
    fillCredentials("customer@example.com", "12345");
    fireEvent.click(screen.getByText("Sign Up"));
    expect(screen.getByRole("alert").textContent).toBe(
      "Password must be at least 6 characters long.",
    );
    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it("creates an account and navigates home", async () => {
    createUserWithEmailAndPassword.mockResolvedValue({});
    renderPage(<Signup />);
    fillCredentials();
    fireEvent.click(screen.getByText("Sign Up"));
    await waitFor(() => expect(screen.getByTestId("current-path").textContent).toBe("/"));
  });

  it("displays duplicate-email and other signup errors", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    createUserWithEmailAndPassword
      .mockRejectedValueOnce({ code: "auth/email-already-in-use" })
      .mockRejectedValueOnce(new Error("Signup unavailable"));
    renderPage(<Signup />);
    fillCredentials();
    fireEvent.click(screen.getByText("Sign Up"));
    expect((await screen.findByRole("alert")).textContent).toMatch(/already registered/);
    fillCredentials();
    fireEvent.click(screen.getByText("Sign Up"));
    expect((await screen.findByRole("alert")).textContent).toBe("Signup unavailable");
  });

  it("supports Google signup and shows provider errors", async () => {
    signInWithPopup.mockRejectedValueOnce(new Error("Google failed"));
    renderPage(<Signup />);
    fireEvent.click(screen.getByText("Sign up with Google"));
    expect((await screen.findByRole("alert")).textContent).toBe("Google failed");
  });
});
