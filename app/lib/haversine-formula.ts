import { CoordinateType } from "../types/coordinate.type";

const EARTH_RADIUS_KM = 6371;
const CRUISING_SPEED_KMH = 850;
const FIXED_BUFFER_HOURS = 0.5;

const toRadian = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

export const calculateDistanceKm = (
  startCoords: CoordinateType,
  endCoords: CoordinateType
): number => {
  const latRadianStart = toRadian(startCoords.lat);
  const latRadianEnd = toRadian(endCoords.lat);

  const deltaLat = toRadian(endCoords.lat - startCoords.lat);
  const deltaLng = toRadian(endCoords.lng - startCoords.lng);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(latRadianStart) *
      Math.cos(latRadianEnd) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceKm = EARTH_RADIUS_KM * c;

  return distanceKm;
};

export const estimateFlightTime = (
  startCoords: CoordinateType,
  endCoords: CoordinateType
): { hours: number; minutes: number; totalMinutes: number } => {
  const distanceKm = calculateDistanceKm(startCoords, endCoords);
  const totalHours = distanceKm / CRUISING_SPEED_KMH + FIXED_BUFFER_HOURS;
  const hours = Math.floor(totalHours);
  const remainingMinutes = Math.round((totalHours - hours) * 60);
  const totalMinutes = hours * 60 + remainingMinutes;

  return {
    hours,
    minutes: remainingMinutes,
    totalMinutes,
  };
};

export const formatFlightTime = (time: {
  hours: number;
  minutes: number;
}): string => {
  if (time.hours === 0) {
    return `${time.minutes}m`;
  }
  return `${time.hours}h ${time.minutes}m`;
};

export const convertMinutesToTime = (
  totalMinutes: number
): { hours: number; minutes: number } => {
  if (isNaN(totalMinutes) || totalMinutes < 0) return { hours: 0, minutes: 0 };
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes };
};
