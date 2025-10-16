/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest/presets/default-esm", // for ESM + TS
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { useESM: true }],
  },
  moduleFileExtensions: ["ts", "js", "json", "node"],
  testMatch: ["**/tests/**/*.test.ts"],
};
