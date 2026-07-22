import React, { useEffect, useRef, useState } from 'react';

let turnstilePromise: Promise<void> | null = null;

const loadTurnstileScript = (): Promise<void> => {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as any).turnstile) return Promise.resolve();

  if (!turnstilePromise) {
    turnstilePromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-solerz-turnstile="1"]');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Turnstile script load failed')));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.setAttribute('data-solerz-turnstile', '1');
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Turnstile script load failed'));
      document.head.appendChild(script);
    });
  }

  return turnstilePromise;
};

interface TurnstileWidgetProps {
  siteKey: string;
  onToken: (token: string | null) => void;
  className?: string;
}

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({ siteKey, onToken, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const cleanSiteKey = siteKey ? siteKey.trim() : '';

  useEffect(() => {
    let active = true;

    if (!cleanSiteKey) {
      onToken(null);
      return;
    }

    loadTurnstileScript()
      .then(() => {
        if (!active || !containerRef.current) return;
        const turnstile = (window as any).turnstile;
        if (!turnstile) return;

        if (widgetIdRef.current) {
          try {
            turnstile.remove(widgetIdRef.current);
          } catch (e) {
            // Ignore remove errors
          }
          widgetIdRef.current = null;
        }

        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: cleanSiteKey,
          callback: (token: string) => {
            if (active) onToken(token);
          },
          'expired-callback': () => {
            if (active) onToken(null);
          },
          'error-callback': () => {
            if (active) onToken(null);
          },
        });
        setLoaded(true);
      })
      .catch((err) => {
        console.warn('Turnstile widget load warning:', err);
        setLoaded(false);
        onToken(null);
      });

    return () => {
      active = false;
      if (widgetIdRef.current && (window as any).turnstile) {
        try {
          (window as any).turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // Ignore remove errors
        }
        widgetIdRef.current = null;
      }
    };
  }, [cleanSiteKey, onToken]);

  if (!cleanSiteKey) return null;

  return (
    <div className={className}>
      <div ref={containerRef} />
      {!loaded && (
        <div className="text-[11px] text-slate-400 mt-1 text-center">
          Loading anti-bot captcha...
        </div>
      )}
    </div>
  );
};

export default TurnstileWidget;
