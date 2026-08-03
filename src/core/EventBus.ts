import { IEventBus } from "./types";

type EventHandler = (...args: any[]) => void;

export class EventBus implements IEventBus {
  private events: Map<string, Set<EventHandler>> = new Map();

  on(event: string, handler: EventHandler) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler);
  }

  off(event: string, handler: EventHandler) {
    this.events.get(event)?.delete(handler);
  }

  emit(event: string, ...args: any[]) {
    this.events.get(event)?.forEach(handler => handler(...args));
  }

  clear() {
    this.events.clear();
  }
}