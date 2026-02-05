import React, { useEffect, useMemo, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, any>) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

let turnstileScriptPromise: Promise<void> | null = null;

const loadTurnstileScript = (): Promise<void> => {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (turnstileScriptPromise) return turnstileScriptPromise;

  turnstileScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-solerz-turnstile="1"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('turnstile_script_load_failed')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.setAttribute('data-solerz-turnstile', '1');
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('turnstile_script_load_failed'));
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
};

export const TurnstileWidget: React.FC<{
  siteKey: string;
  onToken: (token: string | null) => void;
  className?: string;
}> = ({ siteKey, onToken, className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);

  const key = useMemo(() => String(siteKey || '').trim(), [siteKey]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!key) return;
      await loadTurnstileScript();
      if (cancelled) return;

      if (!containerRef.current) return;
      if (!window.turnstile) throw new Error('turnstile_missing');

      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          return;
        } finally {
          widgetIdRef.current = null;
        }
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: key,
        callback: (token: string) => {
          onToken(token);
        },
        'expired-callback': () => {
          onToken(null);
        },
        'error-callback': () => {
          onToken(null);
        },
      });

      setReady(true);
    };

    run().catch(() => {
      setReady(false);
      onToken(null);
    });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          return;
        } finally {
          widgetIdRef.current = null;
        }
      }
    };
  }, [key, onToken]);

  if (!key) return null;

  return (
    <div className={className}>
      <div ref={containerRef} />
      {!ready && <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">Loading captcha...</div>}
    </div>
  );
};
