declare global {
  interface Window {
    grecaptcha: any;
  }
}

export async function executeRecaptcha(action: string): Promise<string> {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    
    if (!siteKey) {
        console.warn('RECAPTCHA_SITE_KEY is not defined');
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
