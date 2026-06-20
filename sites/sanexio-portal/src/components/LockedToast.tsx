import { useEffect } from "react";

type Props = {
  title: string;
  subtitle?: string;
  onClose: () => void;
};

export function LockedToast({ title, subtitle, onClose }: Props) {
  useEffect(() => {
    const t = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(t);
  }, [onClose]);

  return (
    <div className="toast cyber-frame --pink" role="status" aria-live="polite">
      <span className="toast-icon" aria-hidden="true">
        ⨯
      </span>
      <div>
        <strong>{title}</strong>
        <div className="toast-sub">
          {subtitle ?? "Modul gesperrt — Mitarbeiter-Zugang erforderlich."}
        </div>
      </div>
    </div>
  );
}
