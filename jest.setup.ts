/* eslint-disable @typescript-eslint/no-explicit-any */

// 🧠 Polyfill TextEncoder / TextDecoder for React Router
import { TextEncoder, TextDecoder } from "util";

(globalThis as any).TextEncoder = TextEncoder;
(globalThis as any).TextDecoder = TextDecoder as any;

// 🌿 Mock Vite's import.meta.env for Jest (so supabaseClient.ts works)
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_SUPABASE_URL: 'https://mock.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'mock-anon-key',
        NODE_ENV: 'test',
      },
    },
  },
});

// 🧩 Extend expect with jest-dom matchers
import "@testing-library/jest-dom";
