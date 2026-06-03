import { eventEmitter } from './eventEmitter';

/** First refresh after expense mutations (backend listener is async). */
const FIRST_REFRESH_MS = 500;
/** Second refresh in case alert persistence finishes later. */
const SECOND_REFRESH_MS = 1500;

let firstTimeout: ReturnType<typeof setTimeout> | null = null;
let secondTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Refreshes the in-app notification badge and list for all notification frequencies.
 * INSTANT users also receive push; DAILY/WEEKLY rely on this after expense alerts are persisted.
 */
export function scheduleNotificationBadgeRefresh(): void {
  if (firstTimeout) {
    clearTimeout(firstTimeout);
  }
  if (secondTimeout) {
    clearTimeout(secondTimeout);
  }

  firstTimeout = setTimeout(() => {
    firstTimeout = null;
    eventEmitter.emit('notificationReceived');
  }, FIRST_REFRESH_MS);

  secondTimeout = setTimeout(() => {
    secondTimeout = null;
    eventEmitter.emit('notificationReceived');
  }, SECOND_REFRESH_MS);
}
