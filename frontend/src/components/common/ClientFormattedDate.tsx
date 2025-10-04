"use client";

import { useEffect, useState } from 'react';

interface Props {
  date?: string | number | Date;
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
}

export default function ClientFormattedDate({ date = Date.now(), locale = 'en-US', options, className }: Props) {
  const [formatted, setFormatted] = useState<string>('');

  useEffect(() => {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    try {
      setFormatted(d.toLocaleDateString(locale, options));
    } catch {
      setFormatted(d.toISOString().split('T')[0]);
    }
  }, [date, locale, options]);

  return (
    // suppressHydrationWarning because this intentionally renders only on client
    // and may differ from server output
    <span suppressHydrationWarning className={className}>{formatted}</span>
  );
}
