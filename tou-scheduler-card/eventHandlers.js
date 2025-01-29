import {
  INITIAL_INTERVAL,
  INTERVAL_CHANGE,
  INTERVAL_CHANGE_DELAY,
  INTERVAL_CHANGE_START,
  INTERVAL_FASTEST,
} from "./constants.js";

export function startChangingManualBoostValue(instance, change) {
  if (instance._isChangingValue) return; // Prevent multiple intervals to avoid performance issues and unintended behavior
  instance._isChangingValue = true;

  // Directly update the value once on single click
  instance._updateManualBoostValues(change);

  function updateManualBoost() {
    instance._updateManualBoostValues(change);
  }

  // Set an interval to repeatedly update the manual boost value
  instance._interval = setInterval(
    updateManualBoost,
    instance._currentInterval,
  );

  // Clear any existing timeout
  clearTimeout(instance._timeout);

  // Set a timeout to call speedUpChange after a delay
  instance._timeout = setTimeout(
    () => speedUpChange(instance, change),
    INTERVAL_CHANGE_DELAY,
  );
}

export function speedUpChange(instance, change) {
  // Clear the existing interval
  clearInterval(instance._interval);

  // Decrease interval, minimum INTERVAL_FASTEST ms
  instance._currentInterval = Math.max(
    INTERVAL_FASTEST,
    instance._currentInterval - INTERVAL_CHANGE,
  );

  // Update the boost value
  instance._updateManualBoostValues(change);

  // Recurse
  instance._timeout = setTimeout(
    () => speedUpChange(instance, change),
    instance._currentInterval,
  );
}

export function stopChangingValue(instance) {
  // Reset to initial interval
  instance._isChangingValue = false;
  instance._currentInterval = INITIAL_INTERVAL;
  clearInterval(instance._interval);
  clearTimeout(instance._timeout);
}
