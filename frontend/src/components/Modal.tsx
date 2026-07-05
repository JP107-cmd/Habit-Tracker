import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

export default function Modal({ onClose, labelledBy, children }: { onClose: () => void, labelledBy: string, children: ReactNode }) {

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleKeyDown);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
        }
    }, [onClose]);

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div role="dialog" aria-modal="true" aria-labelledby={labelledBy} className="w-full max-h-[90vh] overflow-y-auto">
                {children}
            </div>
        </div>,
        document.body
    )
}
