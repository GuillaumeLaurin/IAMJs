'use client';

import { useTranslations } from "next-intl";

interface FABProps {
    onClick?: () => void;
    title: string;
    label?: string;
}

/**
 * FAB (Floating Action Button)
 * Fixed to bottom-right of the viewport.
 * Icon rotates 90° on hover for a tactile feel.
 */
export default function FAB({ onClick, title, label = 'New Document' }: FABProps) {
  const t = useTranslations('button-action');

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-10 right-10 w-16 h-16 rounded-full bg-primary text-white shadow-[0_12px_32px_rgba(0,50,181,0.3)] flex items-center justify-center active:scale-95 transition-all group z-50"
    >
      <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform duration-300">
        title
      </span>
    </button>
  );
} 