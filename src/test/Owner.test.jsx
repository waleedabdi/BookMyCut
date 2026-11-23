import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import Owner from "../pages/Owner";
import { useAuth } from "../context/useAuth";
import { auth } from "../firebase";
import { renderPage, response } from "./testUtils";

describe("Owner page", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { email: "owner@bookmycut.com" } });
    auth.currentUser = { getIdToken: vi.fn().mockResolvedValue("owner-token") };
    vi.stubGlobal("fetch", vi.fn());
  });

  it("requires a date and a signed-in user", () => {
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    renderPage(<Owner />);
    fireEvent.click(screen.getByText("View Schedule"));
    expect(alert).toHaveBeenCalledWith("Pick a date");
    fireEvent.change(document.querySelector('input[type="date"]'), {
      target: { value: "2026-12-02" },
    });
    auth.currentUser = null;
    fireEvent.click(screen.getByText("View Schedule"));
    expect(alert).toHaveBeenCalledWith("Please sign in again.");
  });

  it("renders schedule results and an empty state", async () => {
    fetch.mockResolvedValueOnce(response([{
      id: "1",
      time: "09:00",
      userEmail: "customer@example.com",
      serviceName: "Haircut",
    }]));
    renderPage(<Owner />);
    fireEvent.change(document.querySelector('input[type="date"]'), {
      target: { value: "2026-12-02" },
    });
    fireEvent.click(screen.getByText("View Schedule"));
    expect(await screen.findByText("customer@example.com")).toBeTruthy();
    expect(fetch).toHaveBeenCalledWith(
      "/api/owner/schedule?date=2026-12-02",
      expect.any(Object),
    );

    fetch.mockResolvedValueOnce(response([]));
    fireEvent.click(screen.getByText("View Schedule"));
    expect(await screen.findByText("No bookings for this date.")).toBeTruthy();
  });

  it("displays schedule errors", async () => {
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    fetch.mockResolvedValueOnce(response({ error: "Schedule unavailable" }, false));
    renderPage(<Owner />);
    fireEvent.change(document.querySelector('input[type="date"]'), {
      target: { value: "2026-12-02" },
    });
    fireEvent.click(screen.getByText("View Schedule"));
    await waitFor(() => expect(alert).toHaveBeenCalledWith("Schedule unavailable"));
    expect(screen.getByText("No bookings for this date.")).toBeTruthy();
  });
});
