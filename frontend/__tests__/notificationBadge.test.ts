import { eventEmitter } from '../src/utils/eventEmitter';
import { scheduleNotificationBadgeRefresh } from '../src/utils/notificationBadge';

describe('scheduleNotificationBadgeRefresh', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('emits notificationReceived so the badge can refresh without push', () => {
    const handler = jest.fn();
    eventEmitter.on('notificationReceived', handler);

    scheduleNotificationBadgeRefresh();

    expect(handler).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);
    expect(handler).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1000);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('debounces rapid expense mutations into one refresh schedule', () => {
    const handler = jest.fn();
    eventEmitter.on('notificationReceived', handler);

    scheduleNotificationBadgeRefresh();
    jest.advanceTimersByTime(300);
    scheduleNotificationBadgeRefresh();

    jest.advanceTimersByTime(500);
    expect(handler).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1000);
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
