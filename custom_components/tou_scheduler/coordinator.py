"""The Solcast Solar integration."""

from __future__ import annotations

from datetime import timedelta
import logging

# from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import CLOUD_UPDATE_INTERVAL, DEBUGGING, DOMAIN

# from .tou_scheduler import TOUScheduler

_LOGGER = logging.getLogger(__name__)
if DEBUGGING:
    _LOGGER.setLevel(logging.DEBUG)
else:
    _LOGGER.setLevel(logging.INFO)


class TOUUpdateCoordinator(DataUpdateCoordinator):
    """Get the current data to update the sensors."""

    def __init__(
        # self, *, hass: HomeAssistant, entry: ConfigEntry, tou_scheduler: TOUScheduler
        self, *, hass: HomeAssistant, update_method) -> None:
        """Initialize the TOUUpdateCoordinator."""
        _LOGGER.info("Initializing TOUUpdateCoordinator")
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_method = update_method,
            update_interval=timedelta(minutes=CLOUD_UPDATE_INTERVAL),
        )
        # self.entry = entry
        # self.tou_scheduler = tou_scheduler

    async def _async_update_data(self):
        """Fetch all data for your sensors here."""
        if self.update_method:
            try:
                return self.update_method()
            except Exception as e:
                _LOGGER.error("Failed to update sensors: %s", e)
                raise UpdateFailed(f"Failed to update sensors: {e}") from e
        return None
