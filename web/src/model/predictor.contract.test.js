import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { score as webScore } from "./predictor.js";

const tolerance = 1e-12;
const contractInput = [5, 70, 1, 7, 4];
const expectedPrediction = 56.244180194724215;

assert.ok(
  Math.abs(webScore(contractInput) - expectedPrediction) < tolerance,
  "score(input) changed for the contract input; check feature order before accepting this change.",
);

const mlModelSource = readFileSync(
  new URL("../../../ml/exports/model.js", import.meta.url),
  "utf8",
);
const mlModelUrl = `data:text/javascript;base64,${Buffer.from(mlModelSource).toString("base64")}`;
const { score: mlScore } = await import(mlModelUrl);

const comparisonCases = [
  contractInput,
  [1, 0, 0, 1, 0],
  [10, 100, 1, 12, 10],
  [7, 82, 0, 8, 3],
];

for (const input of comparisonCases) {
  assert.ok(
    Math.abs(webScore(input) - mlScore(input)) < tolerance,
    `web predictor differs from ml export for input ${JSON.stringify(input)}.`,
  );
}

console.log("Model contract OK");
