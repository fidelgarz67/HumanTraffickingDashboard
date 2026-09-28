// validate.js
// Authentication has been removed; this file is intentionally left as a no-op
// so existing references do not break while the dashboard loads directly.

async function validateCredentials() {
    return true;
}

if (typeof window !== 'undefined') {
    window.validateCredentials = validateCredentials;
} else if (typeof global !== 'undefined') {
    global.validateCredentials = validateCredentials;
}

export { validateCredentials };
