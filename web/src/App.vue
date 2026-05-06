<script setup>
import { ref } from "vue";
import { score } from "./model/predictor.js";

const hoursStudied = ref(5);
const previousScores = ref(70);
const extraActivities = ref("yes");
const isDropdownOpen = ref(false);
const sleepHours = ref(7);
const samplePapers = ref(4);
const prediction = ref(null);

function selectExtraActivity(value) {
  extraActivities.value = value;
  isDropdownOpen.value = false;
}

function predictPerformance() {
  const input = [
    hoursStudied.value,
    previousScores.value,
    extraActivities.value === "yes" ? 1 : 0,
    sleepHours.value,
    samplePapers.value,
  ].map(Number);

  prediction.value = score(input).toFixed(2);
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
        trained on study habits, scores, sleep and practice data.
      </p>

      <section class="card">
        <div class="form-group">
          <label>Hours Studied</label>
          <input type="number" v-model="hoursStudied" min="1" max="10" />
        </div>

        <div class="form-group">
          <label>Previous Scores</label>
          <input type="number" v-model="previousScores" min="0" max="100" />
        </div>

        <div class="form-group">
          <label>Extra Activities</label>

          <div class="custom-select" @click.stop>
            <button
                type="button"
                class="custom-select-trigger"
                @click="isDropdownOpen = !isDropdownOpen"
            >
              <span>{{ extraActivities === "yes" ? "Yes" : "No" }}</span>
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
        </div>

        <div class="form-group">
          <label>Sleep Hours</label>
          <input type="number" v-model="sleepHours" min="1" max="12" />
        </div>

        <div class="form-group">
          <label>Sample Question Papers Practiced</label>
          <input type="number" v-model="samplePapers" min="0" max="10" />
        </div>

        <button class="predict-button" @click="predictPerformance">
          Predict Performance
        </button>

        <div v-if="prediction !== null" class="result">
          <span>Predicted Performance Index</span>
          <strong>{{ prediction }}</strong>
        </div>
      </section>
    </section>
  </main>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Inter:wght@400;500;700&display=swap");

:global(*) {
  box-sizing: border-box;
}

:global(html),
:global(body),
:global(#app) {
  width: 100%;
  min-height: 100%;
  margin: 0;
}

:global(body) {
  overflow-x: hidden;
  font-family: "Inter", sans-serif;
}

.page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  padding: 22px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
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
  width: min(720px, 100%);
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
.result strong {
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
  width: min(520px, 100%);
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