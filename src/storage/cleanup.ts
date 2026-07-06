type CleanupFn = (tripId: string) => Promise<void>;

const hooks: CleanupFn[] = [];

/** Ogni store chiama questa funzione una volta, registrando il proprio cleanup. */
export function registerTripCleanup(fn: CleanupFn): void {
  hooks.push(fn);
}

/** P1 la chiama dentro deleteTrip, prima di rimuovere il viaggio. */
export async function runTripCleanup(tripId: string): Promise<void> {
  for (const fn of hooks) await fn(tripId);
}