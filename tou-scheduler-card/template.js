import { ACTIVE_FONT_SIZE } from "./constants.js";

/**
 * Generates the HTML template for the TOU Scheduler Card.
 * @returns {string} The HTML template string.
 */
const IMAGE_PATHS = {
  arrowUp: "/local/community/tou-scheduler-card/arrow-up-bold-circle.svg",
  arrowDown: "/local/community/tou-scheduler-card/arrow-down-bold-circle.svg",
  cog: "/local/community/tou-scheduler-card/cog.png",
};

function createSliderPopup(id, label, min, max, value, unit) {
  return `
    <div class="slider-popup" id="${id}-popup">
      <label for="${id}-slider">${label}: <span id="${id}-value"></span>${unit}</label>
      <input type="range" id="${id}-slider" min="${min}" max="${max}" value="${value}" />
      <button class="close-btn" data-update="${id}">Close</button>
    </div>
  `;
}

const socPopup = createSliderPopup("min-soc", "Minimum SoC", 10, 90, 11, "%");
const confPopup = createSliderPopup(
  "confidence",
  "Confidence",
  10,
  90,
  22,
  "%",
);

const loadPopup = createSliderPopup("load", "Load days", 1, 10, 3, "");
const timePopup = createSliderPopup(
  "time",
  "Request forecast at hour",
  1,
  23,
  23,
  "",
);

export function getTemplate(image_url) {
  return `
    <style>
      ha-card {
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        background-image: url(${image_url});
        background-color: rgba(255, 255, 255, 0.75); /* transparency */
        background-blend-mode: overlay; /* Blend the image with the color */
        background-size: cover; /* Adjust image size to fit */
        background-position: center; /* Center the image */
      }
      .container {
        width: 90%;
        text-align: center;
        position: relative;
        padding-bottom: 45%; /* Aspect ratio 45% height of the width to crop bottom half */
        overflow: hidden; /* Hide the overflow to crop the bottom half */
        background-color: transparent; /* Ensure no fill */
      }
      .content {
        position: absolute;
        top: 0; /* Align top of content with top of parent */
        left: 0;
        width: 100%;
        height: 200%; /* Double the height to ensure full content is visible before cropping */
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: transparent; /* Ensure no fill */
      }
      svg {
        width: 100%;
        height: auto;
        padding: 10%;
        background-color: transparent; /* Ensure no fill */
      }
      .button {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .button img {
        transform: scale(1.2);
      }
      .button-style {
        background: none;
        border: none;
        cursor: pointer;
      }
      .button img {
        filter: brightness(0) saturate(100%) invert(21%) sepia(99%) saturate(4000%)
          hue-rotate(178deg) brightness(92%) contrast(101%);
      }
      .button:hover img, .button:active img {
        filter: brightness(0) saturate(100%) invert(21%) sepia(100%) saturate(7498%)
          hue-rotate(180deg) brightness(100%) contrast(104%);
      }
      .button:active img {
        transform: scale(1.4);
      }
      .button.up {
        right: 35%;
        top: 38%;
        transform: translateY(-50%);
      }
      .button.down {
        left: 35%;
        top: 38%;
        transform: translateY(-50%);
      }
      .boost-mode {
        position: absolute;
        left: 50%;
        top: 45%;
        transform: translate(-50%, -50%);
        font-size: 20px;
        color: black;
        text-align: center;
        cursor: pointer;
        transition: background 0.3s, transform 0.1s;
      }
      select {
        padding: 5px;
        font-size: ${ACTIVE_FONT_SIZE};
      }
      .settings-button {
        position: absolute;
        right: 3%;
        top: 3%;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .settings-popup {
        display: none;
        position: absolute;
        left: 50%;
        top: 5%; /* Align top of popup with top of parent */
        transform: translate(-50%, 0);
        background: white;
        border: 1px solid #ccc;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        width: 90%; /* 90% of the parent width */
        align-items: center;
        z-index: 1000; /* Ensure the popup is on top */
      }

      .slider-popup{
        display: none;
        position: absolute;
        left: 50%;
        top: 50%;
        width: 80%;
        transform: translate(-50%, -50%);
        background: white;
        border: 1px solid #ccc;
        padding: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 1000;
      }
      .slider-popup input[type="range"] {
        width: 100%;
      }
      .slider-popup .close-btn,
      .close-settings-btn {
        background: #eee;
        border: none;
        padding: 5px 10px;
        cursor: pointer;
        margin-top: 10px;
        align-self: center;
      }
    </style>
    <ha-card>
      <div class="container">
        <div class="content">
          <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <path id="stdArcBkgd" d="" fill="none" stroke="grey" stroke-width="10" />
            <path id="stdArc" d="" fill="none" stroke="green" stroke-width="10" />
            <path id="stdArcTextPath" d="" fill="none" stroke="none" stroke-width="1" />
            <text>
              <textPath
                id="stdText"
                href="#stdArcTextPath"
                text-anchor="middle"
                startOffset="50%"
                font-size="7"
                fill="yellow"
                alignment-baseline="central"
              ></textPath>
            </text>
            <path id="manArcBkgd" d="" fill="none" stroke="grey" stroke-width="12" />
            <path id="manArc" d="" fill="none" stroke="blue" stroke-width="12" />
            <path id="manArcTextPath" d="" fill="none" stroke="none" stroke-width="1" />
            <text>
              <textPath
                id="manText"
                href="#manArcTextPath"
                text-anchor="middle"
                startOffset="50%"
                font-size="7"
                fill="yellow"
                alignment-baseline="central"
              ></textPath>
            </text>
            <text id="manual-number" x="50" y="38" text-anchor="middle" font-size="12" fill="blue">
            </text>
          </svg>
          <button class="button button-style up">
            <img src="${IMAGE_PATHS.arrowUp}" alt="-" width="24" height="24" />
          </button>
          <button class="button button-style down">
            <img src="${IMAGE_PATHS.arrowDown}" alt="-" width="24" height="24" />
          </button>
          <div class="boost-mode">
            <select id="mode-select">
              <option value="Automatic">Automatic</option>
              <option value="Manual" selected>Manual</option>
              <option value="Testing">Testing</option>
              <option value="Off">Off</option>
            </select>
          </div>
          <button class="settings-button">
            <img src="${IMAGE_PATHS.cog}" alt="Settings" width="24" height="24" />
          </button>
          <div class="settings-popup" id="settings-popup">
            <div class="min-soc">
              <button id="minSocText"></button>
            </div>
            ${socPopup}
            <div class="confidence">
              <button id="confidenceText"></button>
            </div>
            ${confPopup}
            <div class="load">
              <button id="loadText"></button>
            </div>
            ${loadPopup}
            <div class="time">
              <button id="timeText"></button>
            </div>
            ${timePopup}
            <button class="close-settings-btn">Close Settings</button>
          </div>
        </div>
      </div>
    </ha-card>
  `;
}
