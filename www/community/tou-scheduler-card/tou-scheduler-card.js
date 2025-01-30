class TouSchedulerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._initialized = false;
    this._hass = null;
    this._config = null;
    this._entityState = null;
    this._entityAttributes = {};
    this._rejected_count = 0;
  }

  connectedCallback() {
    if (!this._initialized) {
      this.render();
      this._initialized = true;
    }
  }

  set hass(hass) {
    if (this._hass !== hass) {
      this._hass = hass;
      this._updateCard();
    }
  }

  setConfig(config) {
    this._config = config;
  }

  _updateCard() {
    if (!this._config || !this._hass) {
      this._rejected_count +=1
      return;
    }
    console.log("Rejected " + this._rejected_count, " calls to _updateCard. Now updating.");
    this._rejected_count = 0;

    const stateObj = this._hass.states[this._config.entity];

    if (!stateObj) {
      this.shadowRoot.innerHTML = `<hui-warning>Entity not found: ${this._config.entity}</hui-warning>`;
      return;
    }

    // Check if the state or attributes have changed
    if (
      this._entityState !== stateObj.state ||
      JSON.stringify(this._entityAttributes) !== JSON.stringify(stateObj.attributes)
    ) {
      this._entityState = stateObj.state;
      this._entityAttributes = { ...stateObj.attributes };
      this.render();
    }
  }

  render() {
    if (!this._config || !this._hass) {
      this.shadowRoot.innerHTML = "";
      return;
    }

    const stateObj = this._hass.states[this._config.entity];

    if (!stateObj) {
      this.shadowRoot.innerHTML = `<hui-warning>Entity not found: ${this._config.entity}</hui-warning>`;
      return;
    }

    // Initialize key values
    this._boostMode = stateObj.state || "off";
    this._manual = parseInt(stateObj.attributes.manual) || 0;
    this._calculated = parseInt(stateObj.attributes.calculated) || 0;
    this._confidence = parseInt(stateObj.attributes.confidence) || 0;
    this._minSoc = parseInt(stateObj.attributes.min_soc) || 0;
    this._loadDays = parseInt(stateObj.attributes.load_days) || 0;
    this._update_hour = parseInt(stateObj.attributes.update_hour) || 0;
    const image_src = stateObj.attributes.plant_image_url || "";
    this._image_url = image_src.replace("elinter-solark", "mysolark");

    this.shadowRoot.innerHTML = getTemplate(this._image_url);

    // Set the default value of the boost mode select element
    const modeSelect = this.shadowRoot.getElementById("mode-select");
    if (modeSelect) {
      modeSelect.value = this._boostMode;
    }

    // Update the card's content based on the new state and attributes
    this._updateSettingsButtons();
    this._updateHTML();

    // Attach event listeners
    this._attachEventListeners();
  }

  _toggleSettingsPopup() {
    const popup = this.shadowRoot.querySelector(".settings-popup");
    if (popup) {
      popup.style.display = popup.style.display === "block" ? "none" : "block";
      if (popup.style.display === "none") {
        this._updateManualBoostValues(0);
      }
    }
  }

  _updateMode() {
    const mode = this.shadowRoot.querySelector("#mode-select").value;
    this._boostMode = mode;
    this._updateManualBoostValues(0);
    // Format the manual number and buttons based on the selected mode
    this._updateHTML();
  }

  _attachEventListeners() {
    this._attachSettingsButtonListeners();
    this._attachBoostLevelButtonListeners();
    this._attachSliderPopupListeners();
    this._attachModeSelectListener();
  }

  _attachSettingsButtonListeners() {
    const settingsButton = this.shadowRoot.querySelector(".settings-button");
    if (settingsButton) {
      settingsButton.addEventListener("click", () =>
        this._toggleSettingsPopup(),
      );
    }
    const settingsDoneButton = this.shadowRoot.querySelector(
      ".close-settings-btn",
    );
    if (settingsDoneButton) {
      settingsDoneButton.addEventListener("click", () =>
        this._toggleSettingsPopup(),
      );
    }
  }

  _attachBoostLevelButtonListeners() {
    const upButton = this.shadowRoot.querySelector(".button.up");
    if (upButton) {
      upButton.addEventListener("mousedown", () => {
        this._startChangingManualBoostValue(1);
      });
      upButton.addEventListener("mouseup", () => {
        this._stopChangingValue();
      });
      upButton.addEventListener("mouseleave", () => {
        this._stopChangingValue();
      });
    }

    const downButton = this.shadowRoot.querySelector(".button.down");
    if (downButton) {
      downButton.addEventListener("mousedown", () => {
        this._startChangingManualBoostValue(-1);
      });
      downButton.addEventListener("mouseup", () => {
        this._stopChangingValue();
      });
      downButton.addEventListener("mouseleave", () => {
        this._stopChangingValue();
      });
    }
    document.addEventListener("mouseup", () => this._stopChangingValue());
  }

  _startChangingManualBoostValue(change) {
    startChangingManualBoostValue(this, change);
  }

  _stopChangingValue() {
    stopChangingValue(this);
  }

  _attachSliderPopupListeners() {
    const minSocText = this.shadowRoot.getElementById("minSocText");
    if (minSocText) {
      minSocText.addEventListener("click", () =>
        this._toggleSliderPopup("min-soc-popup"),
      );
    }
    const confidenceText = this.shadowRoot.getElementById("confidenceText");
    if (confidenceText) {
      confidenceText.addEventListener("click", () =>
        this._toggleSliderPopup("confidence-popup"),
      );
    }
    const loadSlider = this.shadowRoot.getElementById("load-slider");
    if (loadSlider) {
      loadSlider.addEventListener("input", () => {
        this.shadowRoot.getElementById("load-value").textContent =
          loadSlider.value;
        this._loadDays = parseInt(loadSlider.value);
      });
    }
    const timeSlider = this.shadowRoot.getElementById("time-slider");
    if (timeSlider) {
      timeSlider.addEventListener("input", () => {
        this.shadowRoot.getElementById("time-value").textContent =
          timeSlider.value;
        this._update_hour = parseInt(timeSlider.value);
      });
    }
  }

  _updateSettingsButtons() {
    const minSocText = this.shadowRoot.getElementById("minSocText");
    if (minSocText) {
      minSocText.textContent = `Minimum SoC: ${this._minSoc}%`;
    }
    const confidenceText = this.shadowRoot.getElementById("confidenceText");
    if (confidenceText) {
      confidenceText.textContent = `Confidence: ${this._confidence}%`;
    }
    const loadText = this.shadowRoot.getElementById("loadText");
    if (loadText) {
      loadText.textContent = `Load Days: ${this._loadDays}`;
    }
    const timeText = this.shadowRoot.getElementById("timeText");
    if (timeText) {
      timeText.textContent = `Update at ${this._update_hour}:00`;
    }
  }

  _toggleSliderPopup(popupId) {
    // Hide all slider popups
    const popups = this.shadowRoot.querySelectorAll(".slider-popup");
    popups.forEach((popup) => {
      popup.style.display = "none";
    });

    // Show the selected slider popup
    const popup = this.shadowRoot.getElementById(popupId);
    if (popup) {
      popup.style.display = "block";
    }
  }

  _attachModeSelectListener() {
    const modeSelect = this.shadowRoot.getElementById("mode-select");
    if (modeSelect) {
      modeSelect.addEventListener("change", () => this._updateMode());
    }
  }

  _calculateArcPath(start, end, radius) {
    return calculateArcPath(start, end, radius);
  }

  _updateHTML() {
    // Paint the background, foreground, text arc and text for the Automatic Gauge
    const stdText = this.shadowRoot.getElementById("stdText");
    if (stdText) {
      stdText.textContent = `Automatic boost: ${this._calculated}%`;
      stdText.setAttribute("font-size", ACTIVE_FONT_SIZE / 2);
    }
    let stdArcBkgdD = this._calculateArcPath(0, 100, 40);
    const stdArcBkgd = this.shadowRoot.getElementById("stdArcBkgd");
    if (stdArcBkgd) {
      stdArcBkgd.setAttribute("d", stdArcBkgdD);
    }
    let stdArcD = this._calculateArcPath(0, this._calculated, 40);
    const stdArc = this.shadowRoot.getElementById("stdArc");
    if (stdArc) {
      stdArc.setAttribute("d", stdArcD);
    }
    const stdArcTextPath = this.shadowRoot.getElementById("stdArcTextPath");
    if (stdArcTextPath) {
      stdArcTextPath.setAttribute("d", stdArcBkgdD);
    }

    // Paint the background, foreground, text arc and text for the Manual Gauge
    const manText = this.shadowRoot.getElementById("manText");
    if (manText) {
      manText.textContent = `Manual boost: ${this._manual}%`;
      manText.setAttribute("font-size", ACTIVE_FONT_SIZE / 2);
    }
    let manArcBkgdD = this._calculateArcPath(0, 100, 50);
    const manArcBkgd = this.shadowRoot.getElementById("manArcBkgd");
    if (manArcBkgd) {
      manArcBkgd.setAttribute("d", manArcBkgdD);
    }
    let manArcD = this._calculateArcPath(0, this._manual, 50);
    const manArc = this.shadowRoot.getElementById("manArc");
    if (manArc) {
      manArc.setAttribute("d", manArcD);
    }
    const manArcTextPath = this.shadowRoot.getElementById("manArcTextPath");
    if (manArcTextPath) {
      manArcTextPath.setAttribute("d", manArcBkgdD);
    }
    // Now display that same manual number in the center of the gauge
    const manNumber = this.shadowRoot.getElementById("manual-number");
    if (manNumber) {
      manNumber.textContent = this._manual;
      manNumber.setAttribute(
        "font-size",
        this._boostMode === "Automatic"
          ? ACTIVE_FONT_SIZE
          : NON_ACTIVE_FONT_SIZE,
      );
    }
  }

  _initializeSlidersAndButtons() {
    const minSocSlider = this.shadowRoot.getElementById("min-soc-slider");
    const confidenceSlider =
      this.shadowRoot.getElementById("confidence-slider");
    const loadSlider = this.shadowRoot.getElementById("load-slider");
    const timeSlider = this.shadowRoot.getElementById("time-slider");

    if (minSocSlider) {
      minSocSlider.value = this._minSoc;
      this.shadowRoot.getElementById("min-soc-value").textContent =
        this._minSoc;
    }
    if (confidenceSlider) {
      confidenceSlider.value = this._confidence;
      this.shadowRoot.getElementById("confidence-value").textContent =
        this._confidence;
    }
    if (loadSlider) {
      loadSlider.value = this._loadDays;
      this.shadowRoot.getElementById("load-value").textContent = this._loadDays;
    }
    if (timeSlider) {
      timeSlider.value = this._update_hour;
      this.shadowRoot.getElementById("time-value").textContent =
        this._update_hour;
    }

    this._updateSettingsButtons();
  }
}

customElements.define("tou-scheduler-card", TouSchedulerCard);