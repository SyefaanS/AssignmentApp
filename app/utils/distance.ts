export const getDistanceKm = (
  coord1: { latitude: number; longitude: number },
  coord2: { latitude: number; longitude: number }
): number => {
  if (
    !coord1 || !coord2 ||
    typeof coord1.latitude !== 'number' || typeof coord1.longitude !== 'number' ||
    typeof coord2.latitude !== 'number' || typeof coord2.longitude !== 'number'
  ) {
    return 0; // invalid coordinates
  }

  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);

  const lat1Rad = toRad(coord1.latitude);
  const lat2Rad = toRad(coord2.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1Rad) *
    Math.cos(lat2Rad) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Only round if distance > 0
  return distance > 0 ? parseFloat(distance.toFixed(2)) : 0;
};

// 👇 Add this so Expo Router won’t complain
export default {};
