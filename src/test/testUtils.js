import { vi } from "vitest";
import { createElement } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";

function CurrentPath() {
  const location = useLocation();
  return createElement("span", { "data-testid": "current-path" }, location.pathname);
}

export function renderPage(page) {
  return render(createElement(MemoryRouter, null, page, createElement(CurrentPath)));
}

export function response(data, ok = true) {
  return { ok, json: vi.fn().mockResolvedValue(data) };
}

export function fillCredentials(email = "customer@example.com", password = "secret123") {
  fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByPlaceholderText(/Password/), { target: { value: password } });
}
