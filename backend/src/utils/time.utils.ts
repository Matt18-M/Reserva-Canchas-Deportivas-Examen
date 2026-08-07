/**
 * Utilities for PostgreSQL TIME fields stored via Prisma as Date.
 * Always use UTC to avoid timezone shifts between server and client.
 */
export const parseTimeString = (time: string): Date => {
  const [hours, minutes, seconds = '0'] = time.split(':');

  return new Date(
    Date.UTC(1970, 0, 1, Number(hours), Number(minutes), Number(seconds)),
  );
};

export const formatTimeString = (time: Date): string => {
  const hours = String(time.getUTCHours()).padStart(2, '0');
  const minutes = String(time.getUTCMinutes()).padStart(2, '0');
  const seconds = String(time.getUTCSeconds()).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
};
