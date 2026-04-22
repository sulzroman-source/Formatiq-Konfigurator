import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  {
    ignores: [
      "backups/**",
      "viewer-neu/**",
      "neues-projekt/**",
      "main-dev.*.log",
    ],
  },
  ...nextVitals,
  ...nextTypescript,
];

export default config;
