// eslint-config-next 16 ships flat configs directly; FlatCompat is not needed
// (and in fact throws a circular-structure error on next/typescript).
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

export default [
  { ignores: [".next/**", "out/**", "node_modules/**"] },
  ...(Array.isArray(coreWebVitals) ? coreWebVitals : [coreWebVitals]),
  ...(Array.isArray(typescript) ? typescript : [typescript]),
];
