<script setup>
import { ref } from "vue";
import { score } from "./model/predictor.js";

const hoursStudied = ref(5);
const previousScores = ref(70);
const extraActivities = ref("");
const isDropdownOpen = ref(false);
const sleepHours = ref(7);
const samplePapers = ref(4);
const prediction = ref(null);
const validationErrors = ref([]);
const whatIfScenarios = ref([]);
const featureImpacts = ref([]);

const fieldRules = {
  hoursStudied: {
    label: "Hours Studied",
    min: 1,
    max: 9,
  },
  previousScores: {
    label: "Previous Scores",
    min: 40,
    max: 99,
  },
  sleepHours: {
    label: "Sleep Hours",
    min: 4,
    max: 9,
  },
  samplePapers: {
    label: "Sample Question Papers Practiced",
    min: 0,
    max: 9,
  },
};

function selectExtraActivity(value) {
  extraActivities.value = value;
  isDropdownOpen.value = false;
}

function toNumber(value) {
  return Number(value);
}

function formatScore(value) {
  return value.toFixed(2);
}

function formatDelta(value) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}`;
}

function validateNumberField(field, value) {
  const rule = fieldRules[field];

  if (value === "" || value === null || value === undefined) {
    return {
      field,
      message: `${rule.label} is required.`,
    };
  }

  const numericValue = toNumber(value);

  if (!Number.isFinite(numericValue)) {
    return {
      field,
      message: `${rule.label} must be a number.`,
    };
  }

  if (numericValue < rule.min || numericValue > rule.max) {
    return {
      field,
      message: `${rule.label} must be between ${rule.min} and ${rule.max} for a reliable prediction.`,
    };
  }

  return null;
}

function validateForm() {
  const errors = [
    validateNumberField("hoursStudied", hoursStudied.value),
    validateNumberField("previousScores", previousScores.value),
    validateNumberField("sleepHours", sleepHours.value),
    validateNumberField("samplePapers", samplePapers.value),
  ].filter(Boolean);

  if (!["yes", "no"].includes(extraActivities.value)) {
    errors.push({
      field: "extraActivities",
      message: "Extra Activities must be Yes or No.",
    });
  }

  validationErrors.value = errors;
  return errors.length === 0;
}

function hasFieldError(field) {
  return validationErrors.value.some((error) => error.field === field);
}

function firstFieldError(field) {
  return validationErrors.value.find((error) => error.field === field)?.message;
}

function getCurrentValues() {
  return {
    hoursStudied: toNumber(hoursStudied.value),
    previousScores: toNumber(previousScores.value),
    extraActivities: extraActivities.value === "yes" ? 1 : 0,
    sleepHours: toNumber(sleepHours.value),
    samplePapers: toNumber(samplePapers.value),
  };
}

function buildInput(values) {
  return [
    values.hoursStudied,
    values.previousScores,
    values.extraActivities,
    values.sleepHours,
    values.samplePapers,
  ];
}

function runPrediction(values) {
  return score(buildInput(values));
}

function buildWhatIfScenarios(values, basePrediction) {
  const scenarios = [];

  function addScenario(id, label, change, nextValues) {
    const nextPrediction = runPrediction(nextValues);
    const delta = nextPrediction - basePrediction;

    scenarios.push({
      id,
      label,
      change,
      prediction: formatScore(nextPrediction),
      delta,
      deltaLabel: formatDelta(delta),
    });
  }

  if (values.hoursStudied + 1 <= fieldRules.hoursStudied.max) {
    addScenario("hours-plus-one", "+1 Hours Studied", "Study one extra hour", {
      ...values,
      hoursStudied: values.hoursStudied + 1,
    });
  }

  if (values.hoursStudied + 2 <= fieldRules.hoursStudied.max) {
    addScenario("+2-hours", "+2 Hours Studied", "Push study time by two hours", {
      ...values,
      hoursStudied: values.hoursStudied + 2,
    });
  }

  if (values.sleepHours + 1 <= fieldRules.sleepHours.max) {
    addScenario("sleep-plus-one", "+1 Sleep Hour", "Add one hour of sleep", {
      ...values,
      sleepHours: values.sleepHours + 1,
    });
  }

  if (values.samplePapers + 1 <= fieldRules.samplePapers.max) {
    addScenario("paper-plus-one", "+1 Sample Question Paper", "Practice one more paper", {
      ...values,
      samplePapers: values.samplePapers + 1,
    });
  }

  if (values.extraActivities === 0) {
    addScenario("activities-enabled", "Extra Activities: Yes", "Switch No to Yes", {
      ...values,
      extraActivities: 1,
    });
  }

  return scenarios;
}

function buildFeatureImpacts(scenarios) {
  const maxImpact = Math.max(...scenarios.map((scenario) => Math.abs(scenario.delta)), 0);

  return scenarios.map((scenario) => ({
    ...scenario,
    width: maxImpact === 0
      ? "0%"
      : `${Math.max(8, Math.round((Math.abs(scenario.delta) / maxImpact) * 100))}%`,
  }));
}

function predictPerformance() {
  if (!validateForm()) {
    prediction.value = null;
    whatIfScenarios.value = [];
    featureImpacts.value = [];
    return;
  }

  const values = getCurrentValues();
  const basePrediction = runPrediction(values);
  const scenarios = buildWhatIfScenarios(values, basePrediction);

  prediction.value = {
    value: basePrediction,
    label: formatScore(basePrediction),
  };
  whatIfScenarios.value = scenarios;
  featureImpacts.value = buildFeatureImpacts(scenarios);
}
</script>

<template>
  <main class="page" @click="isDropdownOpen = false">
    <div class="grid-bg"></div>
    <div class="glow glow-one"></div>
    <div class="glow glow-two"></div>

    <section class="hero">
      <h1>
        Student<br />
        Performance<br />
        Predictor
      </h1>

      <p class="description">
        Predict <strong>Performance Index</strong> with a browser-based ML model
        trained on study habits, scores, sleep and practice papers.
      </p>

      <section class="card">
        <div class="form-group">
          <label>Hours Studied</label>
          <input
              type="number"
              v-model="hoursStudied"
              min="1"
              max="9"
              :class="{ invalid: hasFieldError('hoursStudied') }"
          />
          <span v-if="hasFieldError('hoursStudied')" class="field-error">
            {{ firstFieldError("hoursStudied") }}
          </span>
        </div>

        <div class="form-group">
          <label>Previous Scores</label>
          <input
              type="number"
              v-model="previousScores"
              min="40"
              max="99"
              :class="{ invalid: hasFieldError('previousScores') }"
          />
          <span v-if="hasFieldError('previousScores')" class="field-error">
            {{ firstFieldError("previousScores") }}
          </span>
        </div>

        <div class="form-group">
          <label>Extra Activities</label>

          <div class="custom-select" @click.stop>
            <button
                type="button"
                class="custom-select-trigger"
                :class="{ invalid: hasFieldError('extraActivities') }"
                @click="isDropdownOpen = !isDropdownOpen"
            >
              <span>
                {{ extraActivities ? (extraActivities === "yes" ? "Yes" : "No") : "Select option" }}
              </span>
              <span class="custom-select-arrow">▼</span>
            </button>

            <div v-if="isDropdownOpen" class="custom-select-menu">
              <button
                  type="button"
                  class="custom-select-option"
                  :class="{ active: extraActivities === 'yes' }"
                  @click="selectExtraActivity('yes')"
              >
                Yes
              </button>

              <button
                  type="button"
                  class="custom-select-option"
                  :class="{ active: extraActivities === 'no' }"
                  @click="selectExtraActivity('no')"
              >
                No
              </button>
            </div>
          </div>
          <span v-if="hasFieldError('extraActivities')" class="field-error">
            {{ firstFieldError("extraActivities") }}
          </span>
        </div>

        <div class="form-group">
          <label>Sleep Hours</label>
          <input
              type="number"
              v-model="sleepHours"
              min="4"
              max="9"
              :class="{ invalid: hasFieldError('sleepHours') }"
          />
          <span v-if="hasFieldError('sleepHours')" class="field-error">
            {{ firstFieldError("sleepHours") }}
          </span>
        </div>

        <div class="form-group">
          <label>Solved Practice Papers</label>
          <input
              type="number"
              v-model="samplePapers"
              min="0"
              max="9"
              :class="{ invalid: hasFieldError('samplePapers') }"
          />
          <span v-if="hasFieldError('samplePapers')" class="field-error">
            {{ firstFieldError("samplePapers") }}
          </span>
        </div>

        <button class="predict-button" @click="predictPerformance">
          Predict Performance
        </button>

        <div v-if="validationErrors.length" class="error-panel">
          <strong>Prediction blocked</strong>
          <span>Fix the highlighted fields before running the model.</span>
        </div>

        <section v-if="prediction !== null" class="insights">
          <div class="result">
            <span>Current Performance Index</span>
            <strong>{{ prediction.label }}</strong>
          </div>

          <div v-if="whatIfScenarios.length" class="what-if-panel">
            <div class="panel-heading">
              <span>What-if Scenarios</span>
              <strong>Projected changes</strong>
            </div>

            <div class="scenario-grid">
              <article
                  v-for="scenario in whatIfScenarios"
                  :key="scenario.id"
                  class="scenario-item"
              >
                <span>{{ scenario.label }}</span>
                <strong>{{ scenario.deltaLabel }}</strong>
                <small>{{ scenario.change }}</small>
                <em>Projected score: {{ scenario.prediction }}</em>
              </article>
            </div>
          </div>

          <div v-if="featureImpacts.length" class="impact-panel">
            <div class="panel-heading">
              <span>Feature Impact</span>
              <strong>One-change lift</strong>
            </div>

            <div class="impact-list">
              <div
                  v-for="impact in featureImpacts"
                  :key="impact.id"
                  class="impact-row"
              >
                <div class="impact-meta">
                  <span>{{ impact.label }}</span>
                  <strong>{{ impact.deltaLabel }}</strong>
                </div>
                <div class="impact-track">
                  <div class="impact-fill" :style="{ width: impact.width }"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </section>
  </main>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Inter:wght@400;500;700&display=swap");

* {
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  min-height: 100%;
  margin: 0;
}

body {
  overflow-x: hidden;
  font-family: "Inter", sans-serif;
}

.page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  padding: 28px 20px 42px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-x: hidden;
  color: #ffffff;
  background:
      linear-gradient(rgba(22, 5, 62, 0.92), rgba(8, 3, 35, 0.98)),
      radial-gradient(circle at top, #33106e 0%, #13052f 45%, #060014 100%);
}

.grid-bg,
.page::after,
.glow {
  position: absolute;
}

.grid-bg {
  inset: 0;
  background-image:
      linear-gradient(rgba(120, 255, 120, 0.16) 1px, transparent 1px),
      linear-gradient(90deg, rgba(120, 255, 120, 0.16) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(to bottom, black 0%, black 65%, transparent 100%);
  opacity: 0.65;
}

.page::after {
  content: "";
  left: -10%;
  right: -10%;
  bottom: -155px;
  height: 300px;
  background:
      linear-gradient(rgba(0, 90, 255, 0.65) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 90, 255, 0.65) 1px, transparent 1px);
  background-size: 48px 32px;
  transform: perspective(420px) rotateX(62deg);
  transform-origin: top;
  box-shadow: 0 -30px 90px rgba(0, 65, 255, 0.5);
}

.glow {
  width: 340px;
  height: 340px;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.52;
}

.glow-one {
  top: 5%;
  left: 10%;
  background: #76ff6a;
}

.glow-two {
  right: 8%;
  bottom: 12%;
  background: #2448ff;
}

.hero {
  position: relative;
  z-index: 2;
  width: min(860px, 100%);
  text-align: center;
}

h1,
.description,
label,
input,
.custom-select-trigger,
.custom-select-option,
.predict-button,
.result span,
.result strong,
.error-panel,
.panel-heading,
.scenario-item,
.impact-meta {
  font-family: "Orbitron", sans-serif;
}

h1 {
  margin: 0;
  font-size: clamp(34px, 6.3vw, 58px);
  line-height: 0.88;
  font-weight: 900;
  color: #7dff72;
  text-transform: uppercase;
  text-shadow:
      0 0 18px rgba(125, 255, 114, 0.45),
      4px 4px 0 rgba(50, 77, 255, 0.65);
}

.description {
  max-width: 640px;
  margin: 18px auto;
  padding: 14px 22px;
  border: 1px solid rgba(125, 255, 114, 0.42);
  border-radius: 22px;
  background:
      linear-gradient(90deg, rgba(125, 255, 114, 0.08), rgba(36, 72, 255, 0.14)),
      rgba(10, 3, 35, 0.58);
  color: #e8e3ff;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.65;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  box-shadow:
      inset 0 0 22px rgba(36, 72, 255, 0.2),
      0 0 22px rgba(125, 255, 114, 0.08);
}

.description strong {
  color: #7dff72;
  font-weight: 900;
  text-shadow:
      0 0 8px rgba(125, 255, 114, 0.75),
      0 0 18px rgba(125, 255, 114, 0.3);
}

.card {
  width: min(640px, 100%);
  margin: 0 auto;
  padding: 22px 26px 24px;
  border: 1px solid rgba(125, 255, 114, 0.65);
  border-radius: 26px;
  background: rgba(12, 3, 42, 0.78);
  box-shadow:
      0 0 40px rgba(125, 255, 114, 0.12),
      0 22px 70px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(14px);
}

.form-group {
  margin-bottom: 13px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 7px;
  color: #7dff72;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}

input,
.custom-select-trigger {
  width: 100%;
  height: 46px;
  border: 1px solid rgba(125, 255, 114, 0.5);
  border-radius: 999px;
  outline: none;
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  transition: 0.2s ease;
}

input {
  padding: 0 18px;
}

.custom-select-trigger {
  margin: 0;
  padding: 0 28px 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: none;
  text-transform: none;
  cursor: pointer;
}

input[type="number"] {
  appearance: textfield;
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  appearance: none;
  -webkit-appearance: none;
  margin: 0;
}

input:focus,
.custom-select-trigger:hover,
.custom-select-trigger:focus {
  border-color: #7dff72;
  box-shadow: 0 0 0 4px rgba(125, 255, 114, 0.15);
}

input.invalid,
.custom-select-trigger.invalid {
  border-color: #ff4f8b;
  box-shadow:
      0 0 0 4px rgba(255, 79, 139, 0.14),
      0 0 16px rgba(255, 79, 139, 0.28);
}

.field-error {
  display: block;
  margin-top: 7px;
  color: #ff9dbc;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.custom-select {
  position: relative;
}

.custom-select-arrow {
  color: #7dff72;
  font-size: 13px;
  line-height: 1;
  text-shadow: 0 0 10px rgba(125, 255, 114, 0.75);
}

.custom-select-menu {
  position: absolute;
  z-index: 20;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  padding: 8px;
  border: 1px solid rgba(125, 255, 114, 0.65);
  border-radius: 20px;
  background: rgba(12, 3, 42, 0.97);
  box-shadow:
      0 0 28px rgba(125, 255, 114, 0.22),
      0 18px 40px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(14px);
}

.custom-select-option {
  width: 100%;
  height: 40px;
  margin: 0;
  padding: 0 14px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-align: left;
  box-shadow: none;
  text-transform: none;
  cursor: pointer;
}

.custom-select-option:hover {
  background: rgba(125, 255, 114, 0.12);
  color: #7dff72;
}

.custom-select-option.active {
  background: #7dff72;
  color: #13052f;
  box-shadow: 0 0 16px rgba(125, 255, 114, 0.45);
}

.predict-button {
  width: 100%;
  margin-top: 4px;
  padding: 14px 18px;
  border: 1px solid #7dff72;
  border-radius: 999px;
  background: #7dff72;
  color: #13052f;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow:
      0 0 20px rgba(125, 255, 114, 0.5),
      0 8px 0 #2448ff;
  transition: 0.18s ease;
}

.predict-button:hover {
  transform: translateY(-3px);
  box-shadow:
      0 0 26px rgba(125, 255, 114, 0.75),
      0 11px 0 #2448ff;
}

.predict-button:active {
  transform: translateY(4px);
  box-shadow:
      0 0 18px rgba(125, 255, 114, 0.45),
      0 4px 0 #2448ff;
}

.result {
  margin-top: 18px;
  padding: 16px;
  border: 1px solid rgba(125, 255, 114, 0.65);
  border-radius: 20px;
  background: rgba(125, 255, 114, 0.1);
  text-align: center;
}

.error-panel {
  margin-top: 16px;
  padding: 13px 16px;
  border: 1px solid rgba(255, 79, 139, 0.68);
  border-radius: 18px;
  background:
      linear-gradient(90deg, rgba(255, 79, 139, 0.14), rgba(36, 72, 255, 0.1)),
      rgba(28, 4, 34, 0.72);
  color: #ffdce8;
  text-align: left;
  box-shadow:
      inset 0 0 20px rgba(255, 79, 139, 0.12),
      0 0 24px rgba(255, 79, 139, 0.12);
}

.error-panel strong,
.error-panel span {
  display: block;
}

.error-panel strong {
  margin-bottom: 4px;
  color: #ff9dbc;
  font-size: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.error-panel span {
  font-size: 11px;
  line-height: 1.45;
}

.result span {
  display: block;
  margin-bottom: 5px;
  color: #7dff72;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(125, 255, 114, 0.45);
}

.result strong {
  display: block;
  color: #7dff72;
  font-size: 34px;
  text-shadow: 0 0 18px rgba(125, 255, 114, 0.6);
}

.insights {
  margin-top: 18px;
}

.what-if-panel,
.impact-panel {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid rgba(36, 200, 255, 0.45);
  border-radius: 20px;
  background:
      linear-gradient(135deg, rgba(36, 72, 255, 0.16), rgba(125, 255, 114, 0.08)),
      rgba(8, 3, 35, 0.62);
  box-shadow:
      inset 0 0 24px rgba(36, 72, 255, 0.18),
      0 0 26px rgba(36, 72, 255, 0.12);
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 13px;
  text-align: left;
  text-transform: uppercase;
}

.panel-heading span {
  color: #7dff72;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 1px;
}

.panel-heading strong {
  color: #7ecbff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.9px;
}

.scenario-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.scenario-item {
  position: relative;
  min-height: 94px;
  padding: 13px;
  overflow: hidden;
  border: 1px solid rgba(125, 255, 114, 0.3);
  border-radius: 16px;
  background:
      linear-gradient(135deg, rgba(125, 255, 114, 0.1), rgba(36, 72, 255, 0.16)),
      rgba(255, 255, 255, 0.04);
  text-align: left;
}

.scenario-item::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(125, 255, 114, 0.18), transparent 42%);
  opacity: 0.45;
}

.scenario-item span,
.scenario-item strong,
.scenario-item small,
.scenario-item em {
  position: relative;
  z-index: 1;
  display: block;
}

.scenario-item span {
  min-height: 29px;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.scenario-item strong {
  margin: 8px 0 5px;
  color: #7dff72;
  font-size: 23px;
  text-shadow: 0 0 14px rgba(125, 255, 114, 0.58);
}

.scenario-item small {
  color: #d9ecff;
  font-size: 10px;
  line-height: 1.4;
  letter-spacing: 0.4px;
}

.scenario-item em {
  margin-top: 6px;
  color: #7ecbff;
  font-size: 11px;
  font-style: normal;
  font-weight: 900;
  line-height: 1.35;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(126, 203, 255, 0.44);
}

.impact-list {
  display: grid;
  gap: 13px;
}

.impact-row {
  display: grid;
  gap: 7px;
}

.impact-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.7px;
  text-align: left;
  text-transform: uppercase;
}

.impact-meta strong {
  flex: 0 0 auto;
  color: #7dff72;
  text-shadow: 0 0 12px rgba(125, 255, 114, 0.48);
}

.impact-track {
  position: relative;
  height: 11px;
  overflow: hidden;
  border: 1px solid rgba(125, 255, 114, 0.38);
  border-radius: 999px;
  background:
      linear-gradient(90deg, rgba(125, 255, 114, 0.08), rgba(36, 72, 255, 0.16)),
      rgba(255, 255, 255, 0.06);
}

.impact-track::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: linear-gradient(90deg, transparent 0 78%, rgba(255, 255, 255, 0.22) 78% 80%, transparent 80%);
  background-size: 26px 100%;
  opacity: 0.42;
}

.impact-fill {
  position: relative;
  z-index: 1;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #7dff72, #7ecbff);
  box-shadow:
      0 0 12px rgba(125, 255, 114, 0.62),
      0 0 22px rgba(126, 203, 255, 0.3);
}

@media (max-height: 780px) {
  .page {
    padding: 14px 18px;
  }

  h1 {
    font-size: clamp(30px, 5.2vw, 48px);
  }

  .description {
    margin: 14px auto;
    padding: 10px 16px;
    font-size: 13px;
  }

  .card {
    padding: 18px 24px 20px;
  }

  .form-group {
    margin-bottom: 10px;
  }

  input,  .custom-select-trigger {
    height: 42px;
  }

  .predict-button {
    padding: 12px 16px;
  }
}

@media (max-width: 720px) {
  .scenario-grid {
    grid-template-columns: 1fr;
  }

  .panel-heading,
  .impact-meta {
    display: grid;
  }
}

@media (max-width: 560px) {
  .page {
    padding: 24px 14px;
    align-items: flex-start;
    overflow-y: auto;
  }

  .card {
    padding: 20px;
    border-radius: 22px;
  }

  .description {
    border-radius: 20px;
  }
}
</style>
