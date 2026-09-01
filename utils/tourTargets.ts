type Rect = { x: number; y: number; width: number; height: number };
type MeasureFn = () => Promise<Rect>;

const registry = new Map<string, MeasureFn>();

export const tourTargets = {
  register(id: string, fn: MeasureFn) { registry.set(id, fn); },
  unregister(id: string) { registry.delete(id); },
  measure(id: string): Promise<Rect> | null { return registry.get(id)?.() ?? null; },
};
