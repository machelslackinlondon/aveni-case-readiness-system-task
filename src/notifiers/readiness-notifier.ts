import type { ReadinessEvent } from "../domain/types";

export type ReadinessNotifier = {
  notify(event: ReadinessEvent): void;
};

export class InMemoryReadinessNotifier implements ReadinessNotifier {
  private readonly events: ReadinessEvent[] = [];

  notify(event: ReadinessEvent) {
    this.events.push({ ...event });
  }

  list(): ReadinessEvent[] {
    return this.events.map((event) => ({ ...event }));
  }
}
