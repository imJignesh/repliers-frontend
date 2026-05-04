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

    return new Promise((resolve) => {
        window.grecaptcha.ready(() => {
            window.grecaptcha.execute(siteKey, { action }).then((token: string) => {
                resolve(token);
            });
        });
    });
}
