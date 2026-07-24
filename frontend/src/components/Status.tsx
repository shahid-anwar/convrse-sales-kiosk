export function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-kiosk-subtext">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-kiosk-border border-t-kiosk-accent" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="text-sm text-kiosk-danger">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md border border-kiosk-border px-4 py-1.5 text-sm text-kiosk-text hover:bg-kiosk-panel"
        >
          Try again
        </button>
      )}
    </div>
  );
}
