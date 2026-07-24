// A stable id per browser tab, used only to tag interest signals with
// "which screen noticed this" - not an auth mechanism. Falls back
// gracefully if sessionStorage or crypto.randomUUID are unavailable.
export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";

  const key = "kiosk-device-id";
  try {
    let id = window.sessionStorage.getItem(key);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      window.sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    return `device-${Date.now()}`;
  }
}
