// Path: shared\utils\events.ts
export const EventEmitter = {
  events: {} as Record<string, Function[]>,

  dispatch(event: string, data: any) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  },

  subscribe(event: string, callback: Function) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  },

  unsubscribe(event: string) {
    if (!this.events[event]) return;
    delete this.events[event];
  },
};
