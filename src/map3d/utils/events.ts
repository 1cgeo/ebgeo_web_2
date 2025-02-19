// Path: map3d\utils\events.ts
export type EventCallback<T = any> = (data: T) => void;

export const EventEmitter = {
  events: {} as Record<string, EventCallback[]>,

  dispatch<T>(event: string, data: T) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  },

  subscribe<T>(event: string, callback: EventCallback<T>) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback as EventCallback);

    // Return unsubscribe function
    return () => this.unsubscribe(event, callback);
  },

  unsubscribe<T>(event: string, callback?: EventCallback<T>) {
    if (!this.events[event]) return;

    if (callback) {
      // Remove specific callback
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    } else {
      // Remove all callbacks for this event
      delete this.events[event];
    }
  },
};
