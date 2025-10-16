// Basic smoke test to ensure Jest is running

describe("Smoke Test", () => {
  test("true should be true", () => {
    expect(true).toBe(true);
  });

  test("adds numbers correctly", () => {
    const sum = 2 + 3;
    expect(sum).toBe(5);
  });
});
