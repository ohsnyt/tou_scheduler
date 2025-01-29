/**
 * Finds and filters entities based on the provided criteria.
 * @param hass - home assistant object so we can get the entities for this domain
 * @param maxEntities - limit on how many entities to extract, just in case there are too many
 * @param entities - an array of entity IDs that the method will consider for filtering
 * @param entitiesFallback  - a fallback list if the entities array is empty
 * @param {Array} entitiesFallback - The fallback list of entities if the primary list is empty.
 * @param {Array} includeDomains - The list of domains to include in the filtered results.
 * @returns {Array} The filtered list of entities.
 */
export function findEntities(
  hass,
  maxEntities,
  entities,
  entitiesFallback,
  includeDomains,
) {
  const allEntities = entities.length ? entities : entitiesFallback;
  const filteredEntities = [];
  for (const entity of allEntities) {
    const [domain] = entity.split(".");
    if (includeDomains.includes(domain) && hass.states[entity]) {
      filteredEntities.push(entity);
      if (filteredEntities.length >= maxEntities) {
        break;
      }
    }
  }
  return filteredEntities;
}
/**
 * Calculates the SVG path for an arc based on the given start and end percentages and radius.
 * @param {number} start_percent - The starting percentage of the arc (0-100).
 * @param {number} end_percent - The ending percentage of the arc (0-100).
 * @param {number} radius - The radius of the arc.
 * @returns {string} The SVG path data for the arc.
 */
export function calculateArcPath(start_percent, end_percent, radius) {
  const startAngle = (start_percent / 100) * 180 - 180; // Start at 9 o'clock
  const endAngle = (end_percent / 100) * 180 - 180; // End angle based on end_percent
  const startX = 50 + radius * Math.cos((Math.PI * startAngle) / 180);
  const endX = 50 + radius * Math.cos((Math.PI * endAngle) / 180);
  const startY = 50 + radius * Math.sin((Math.PI * startAngle) / 180);
  const endY = 50 + radius * Math.sin((Math.PI * endAngle) / 180);
  return `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;
}
