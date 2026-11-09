declare global {
  interface Window {
    grecaptcha: any;
  }
}

/**
 * Dynamically loads the reCAPTCHA script if it hasn't been loaded yet.
 * This handles the case where the script is lazy-loaded and a user
 * reaches a form before the idle-time load has completed.
 */
function loadRecaptchaScript(siteKey: string): Promise<void> {
    if (window.grecaptcha) return Promise.resolve();

    // Audit R09 (6 Nov 2026 retest): only the existing-script branch had a
    // deadline. A newly added script whose load/error never fired left the
    // enquiry button pending forever. Both branches now share one deadline and
    // settle exactly once, clearing their timers and listeners.
    return new Promise((resolve, reject) => {
        let settled = false;
        let interval: ReturnType<typeof setInterval> | undefined;
        let script: HTMLScriptElement | null = null;

        const cleanup = () => {
            clearTimeout(deadline);
            if (interval) clearInterval(interval);
            if (script) {
                script.removeEventListener('load', onLoad);
                script.removeEventListener('error', onError);
            }
        };
        const settle = (error?: Error) => {
            if (settled) return;
            settled = true;
            cleanup();
            if (error) reject(error);
            else resolve();
        };
        const onLoad = () => settle();
        const onError = () => settle(new Error('Failed to load reCAPTCHA'));
        const deadline = setTimeout(
            () => settle(new Error('reCAPTCHA load timeout')),
            RECAPTCHA_LOAD_TIMEOUT_MS
        );

        // Script tag exists (queued but not yet executed): poll for readiness.
        if (document.querySelector(`script[src*="recaptcha/api.js"]`)) {
            interval = setInterval(() => {
                if (window.grecaptcha) settle();
            }, 100);
            return;
        }

        script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
        script.async = true;
        script.defer = true;
        script.addEventListener('load', onLoad);
        script.addEventListener('error', onError);
        document.body.appendChild(script);
    });
}

export async function executeRecaptcha(action: string): Promise<string> {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    
    if (!siteKey) {
        console.warn('RECAPTCHA_SITE_KEY is not defined');
        return '';
    }

    // Ensure script is loaded (handles lazy-load race condition)
    try {
        await loadRecaptchaScript(siteKey);
    } catch {
        console.warn('Failed to load reCAPTCHA script');
        return '';
    }

    if (!window.grecaptcha) {
        console.warn('grecaptcha is not loaded');
        return '';
    }

    // Audit R09: execute() previously had no rejection handler and no deadline,
    // so a failing or never-settling reCAPTCHA left the enquiry button spinning.
    // The whole step now always settles: a token, or '' (the API then rejects
    // the submission and the form shows its error and re-enables).
    return new Promise((resolve) => {
        let settled = false;
        const finish = (token: string) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve(token);
        };
        const timer = setTimeout(() => {
            console.warn('reCAPTCHA execute timed out');
            finish('');
        }, RECAPTCHA_EXECUTE_TIMEOUT_MS);

        try {
            window.grecaptcha.ready(() => {
                Promise.resolve()
                    .then(() => window.grecaptcha.execute(siteKey, { action }))
                    .then((token: string) => finish(token || ''))
                    .catch((error: unknown) => {
                        console.warn('reCAPTCHA execute failed', error);
                        finish('');
                    });
            });
        } catch (error) {
            console.warn('reCAPTCHA ready failed', error);
            finish('');
        }
    });
}

export const RECAPTCHA_EXECUTE_TIMEOUT_MS = 8000;
export const RECAPTCHA_LOAD_TIMEOUT_MS = 10000;
