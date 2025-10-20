/**
 * 🧪 Smoke Test Suite
 * Ensures the React app, imports, and components build without errors.
 */
import { render } from "@testing-library/react";
import App from "../src/App";

// Basic Jest sanity checks
describe("Environment Smoke Test", () => {
  test("Jest is running properly", () => {
    expect(true).toBe(true);
  });

  test("adds numbers correctly", () => {
    const sum = 2 + 3;
    expect(sum).toBe(5);
  });
});

// React component mount test
describe("React App Mount Test", () => {
  test("App component renders without crashing", () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
