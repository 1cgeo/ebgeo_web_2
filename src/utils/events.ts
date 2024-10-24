import { Events } from "../ts/interfaces/global.interfaces";

export const EventEmitter = {
  _events: {} as Events,
  dispatch(event: string, data: any) {
    if (!this._events[event]) return;
    this._events[event].forEach((callback: any) => callback(data));
  },
  subscribe(event: string, callback: (data: any) => any) {
    if (!this._events[event]) this._events[event] = [];
    this._events[event].push(callback);
  },
  unsubscribe(event: string) {
    if (!this._events[event]) return;
    delete this._events[event];
  },
};
