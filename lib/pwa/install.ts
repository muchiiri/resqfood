// Client-only install state for the "Install app" menu entry. Browsers that can install the app fire
// beforeinstallprompt once; it is kept here so the menu can use it whenever the person opens it. Import this only
// from client components.

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type InstallState = {
  // The browser has an install prompt ready and the app is not installed yet.
  canPrompt: boolean;
  // iPhone or iPad in a browser: there is no prompt, so the menu explains the Share menu steps instead.
  showIosHint: boolean;
};

const HIDDEN: InstallState = { canPrompt: false, showIosHint: false };

let deferred: InstallPromptEvent | null = null;
let installed = false;
let started = false;
let snapshot: InstallState = HIDDEN;
const listeners = new Set<() => void>();

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

const isIos = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

function update() {
  const canPrompt = !installed && deferred !== null;
  const showIosHint = !installed && !canPrompt && isIos();
  // Keep the same object while nothing changed, as useSyncExternalStore requires.
  if (canPrompt !== snapshot.canPrompt || showIosHint !== snapshot.showIosHint) {
    snapshot = canPrompt || showIosHint ? { canPrompt, showIosHint } : HIDDEN;
  }
  listeners.forEach((listener) => listener());
}

// Call once when the app shell mounts so the install event is not missed.
export function startInstallListeners() {
  if (started || typeof window === "undefined") return;
  started = true;
  installed = isStandalone();

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferred = event as InstallPromptEvent;
    update();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    installed = true;
    update();
  });
  update();
}

export const subscribeInstall = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getInstallState = (): InstallState => snapshot;
export const getServerInstallState = (): InstallState => HIDDEN;

// Opens the browser's install prompt. The event can be used once, so the entry disappears afterwards.
export async function promptInstall(): Promise<void> {
  const event = deferred;
  if (!event) return;
  deferred = null;
  update();
  await event.prompt();
  await event.userChoice;
}
