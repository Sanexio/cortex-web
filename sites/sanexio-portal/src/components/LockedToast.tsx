import { useEffect } from "react";

type Props = {
  title: string;
  onClose: () => void;
};

export function LockedToast({ title, onClose }: Props) {
  useEffect(() => {
    const t = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(t);
  }, [onClose]);

  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast-icon" aria-hidden="true">
        ⨯
      </span>
      <div>
        <strong>{title}</strong>
        <div className="toast-sub">Modul gesperrt — Mitarbeiter-Zugang erforderlich.</div>
      </div>
    </div>
  );
}
