import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import MyBookings from "../pages/MyBookings";
import { useAuth } from "../context/useAuth";
import { auth } from "../firebase";
import { renderPage, response } from "./testUtils";

describe("My Bookings page", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { email: "customer@example.com" } });
    auth.currentUser = { getIdToken: vi.fn().mockResolvedValue("booking-token") };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response([])));
  });

  it("shows the empty state when the user has no bookings", async () => {
    renderPage(<MyBookings />);
    expect(await screen.findByText("You don't have any active bookings.")).toBeTruthy();
  });

  it("shows bookings and cancels one after confirmation", async () => {
    fetch
      .mockResolvedValueOnce(response([{
        id: "booking/1",
        serviceName: "Haircut",
        date: "2026-12-02",
        time: "09:00",
      }]))
      .mockResolvedValueOnce(response({}))
      .mockResolvedValueOnce(response([]));
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    renderPage(<MyBookings />);
    fireEvent.click(await screen.findByText("Cancel"));
    await waitFor(() => expect(alert).toHaveBeenCalledWith("Booking Cancelled"));
    expect(fetch).toHaveBeenCalledWith(
      "/api/bookings/booking%2F1",
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(await screen.findByText("You don't have any active bookings.")).toBeTruthy();
  });

  it("does not cancel when confirmation is declined", async () => {
    fetch.mockResolvedValueOnce(response([{
      id: "1",
      serviceName: "Trim",
      date: "2026-12-02",
      time: "10:00",
    }]));
    vi.spyOn(window, "confirm").mockReturnValue(false);
    renderPage(<MyBookings />);
    fireEvent.click(await screen.findByText("Cancel"));
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("shows a fetch error and handles a missing user during loading", async () => {
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    fetch.mockRejectedValueOnce(new Error("offline"));
    renderPage(<MyBookings />);
    expect(await screen.findByText("You don't have any active bookings.")).toBeTruthy();
    expect(alert).toHaveBeenCalledWith("Error loading bookings. Is your API running?");

    cleanup();
    auth.currentUser = null;
    renderPage(<MyBookings />);
    expect(await screen.findByText("You don't have any active bookings.")).toBeTruthy();
  });

  it("handles cancellation failure and a missing current user", async () => {
    fetch
      .mockResolvedValueOnce(response([{
        id: "1",
        serviceName: "Trim",
        date: "2026-12-02",
        time: "10:00",
      }]))
      .mockResolvedValueOnce(response({ error: "Cannot cancel" }, false));
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    renderPage(<MyBookings />);
    fireEvent.click(await screen.findByText("Cancel"));
    await waitFor(() => expect(alert).toHaveBeenCalledWith("Cannot cancel"));

    cleanup();
    fetch.mockResolvedValueOnce(response([{
      id: "2",
      serviceName: "Cut",
      date: "2026-12-03",
      time: "11:00",
    }]));
    renderPage(<MyBookings />);
    const cancelButton = await screen.findByText("Cancel");
    auth.currentUser = null;
    fireEvent.click(cancelButton);
    expect(alert).toHaveBeenCalledWith("Please sign in again.");
  });
});
