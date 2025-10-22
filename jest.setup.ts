/* eslint-disable @typescript-eslint/no-explicit-any */

// 🧠 Polyfill TextEncoder / TextDecoder
import { TextEncoder, TextDecoder } from "util";
(globalThis as any).TextEncoder = TextEncoder;
(globalThis as any).TextDecoder = TextDecoder as any;

// 🌿 Properly mock Vite's import.meta.env for Jest
Object.defineProperty(globalThis, "import", {
  value: { meta: { env: {} } },
});

(globalThis as any).import.meta.env = {
  VITE_SUPABASE_URL: "https://mock.supabase.co",
  VITE_SUPABASE_ANON_KEY: "mock-anon-key",
  VITE_SUPABASE_SERVICE_ROLE_KEY: "mock-service-role",
  VITE_CONTACT_FORM_MODE: "disabled",
  NODE_ENV: "test",
};

// 🧩 Extend expect with jest-dom matchers
import "@testing-library/jest-dom";
