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

    return new Promise((resolve, reject) => {
        // Check if script tag already exists (queued but not yet executed)
        if (document.querySelector(`script[src*="recaptcha/api.js"]`)) {
            // Script tag exists but hasn't finished — poll for readiness
            const interval = setInterval(() => {
                if (window.grecaptcha) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
            setTimeout(() => { clearInterval(interval); reject(new Error('reCAPTCHA load timeout')); }, 10000);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load reCAPTCHA'));
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
