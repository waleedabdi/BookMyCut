import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import Home from "../pages/Home";
import { useAuth } from "../context/useAuth";
import { auth } from "../firebase";
import { getDocs } from "firebase/firestore";
import { renderPage, response } from "./testUtils";

describe("Home page", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { displayName: "Ada" } });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response([])));
    getDocs.mockResolvedValue({ docs: [] });
  });

  it("shows services and customer greeting", () => {
    renderPage(<Home />);
    expect(screen.getByText(/Welcome back,/)).toBeTruthy();
    expect(screen.getByText("Ada")).toBeTruthy();
    expect(screen.getByText("Haircut")).toBeTruthy();
    expect(screen.getByText("Facial")).toBeTruthy();
  });

  it("requires a date before checking availability", () => {
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    renderPage(<Home />);
    fireEvent.click(screen.getByText("Haircut"));
    fireEvent.click(screen.getByText("Check Slots"));
    expect(alert).toHaveBeenCalledWith("Please pick a date first!");
  });

  it("blocks holiday dates", async () => {
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    fetch.mockResolvedValueOnce(response([{ date: "2026-12-25", localName: "Christmas" }]));
    renderPage(<Home />);
    fireEvent.click(screen.getByText("Haircut"));
    expect(await screen.findByText(/Note: We are closed on these upcoming holidays/)).toBeTruthy();
    fireEvent.change(document.querySelector('input[type="date"]'), {
      target: { value: "2026-12-25" },
    });
    fireEvent.click(screen.getByText("Check Slots"));
    expect(alert).toHaveBeenCalledWith(
      "Sorry, we are closed on Christmas! Please pick another date.",
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("loads available slots from Firestore when the API fails", async () => {
    fetch.mockResolvedValueOnce(response([])).mockRejectedValueOnce(new Error("offline"));
    getDocs.mockResolvedValue({ docs: [{ data: () => ({ time: "09:00" }) }] });
    renderPage(<Home />);
    fireEvent.click(screen.getByText("Haircut"));
    fireEvent.change(document.querySelector('input[type="date"]'), {
      target: { value: "2026-12-02" },
    });
    fireEvent.click(screen.getByText("Check Slots"));
    expect(await screen.findByText("10:00")).toBeTruthy();
    expect(screen.queryByText("09:00")).toBeNull();
    expect(getDocs).toHaveBeenCalled();
  });

  it("shows a full-booking state if both slot sources fail", async () => {
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    fetch.mockResolvedValueOnce(response([])).mockRejectedValueOnce(new Error("offline"));
    getDocs.mockRejectedValue(new Error("Firestore unavailable"));
    renderPage(<Home />);
    fireEvent.click(screen.getByText("Haircut"));
    fireEvent.change(document.querySelector('input[type="date"]'), {
      target: { value: "2026-12-02" },
    });
    fireEvent.click(screen.getByText("Check Slots"));
    expect(await screen.findByText("Fully Booked!")).toBeTruthy();
    expect(alert).toHaveBeenCalledWith("Unable to load available slots. Please try again.");
  });

  it("books an appointment and refreshes the available slots", async () => {
    auth.currentUser = { getIdToken: vi.fn().mockResolvedValue("test-token") };
    fetch
      .mockResolvedValueOnce(response([]))
      .mockResolvedValueOnce(response(["09:00"]))
      .mockResolvedValueOnce(response({}))
      .mockResolvedValueOnce(response(["10:00"]));
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    renderPage(<Home />);
    fireEvent.click(screen.getByText("Haircut"));
    fireEvent.change(document.querySelector('input[type="date"]'), {
      target: { value: "2026-12-02" },
    });
    fireEvent.click(screen.getByText("Check Slots"));
    fireEvent.click(await screen.findByText("09:00"));
    fireEvent.click(screen.getByText("Confirm Booking for 09:00"));
    await waitFor(() => expect(alert).toHaveBeenCalledWith("Booking Successful!"));
    expect(fetch).toHaveBeenCalledWith("/api/book", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
    }));
    expect(await screen.findByText("10:00")).toBeTruthy();
  });

  it("requires sign-in before booking", async () => {
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    fetch.mockResolvedValueOnce(response([])).mockResolvedValueOnce(response(["09:00"]));
    renderPage(<Home />);
    fireEvent.click(screen.getByText("Haircut"));
    fireEvent.change(document.querySelector('input[type="date"]'), {
      target: { value: "2026-12-02" },
    });
    fireEvent.click(screen.getByText("Check Slots"));
    fireEvent.click(await screen.findByText("09:00"));
    fireEvent.click(screen.getByText("Confirm Booking for 09:00"));
    expect(alert).toHaveBeenCalledWith("Please sign in again before booking.");
  });
});
