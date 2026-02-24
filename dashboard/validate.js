// validate.js

// Client-side authentication helper.
// This file should not contain AWS credentials or AWS SDK calls in-browser.
// It calls a server-side endpoint to perform authentication so secrets remain server-side.

async function validateCredentials(username, password) {
    const isLocal = (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost');
    const apiUrl = isLocal ? 'http://localhost:3000/auth' : '/api/auth';

    try {
        const resp = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!resp.ok) {
            console.error('Auth server error', resp.status);
            return false;
        }

        const data = await resp.json();
        return !!data.authenticated;
    } catch (err) {
        console.error('Failed to reach auth server', err);
        return false;
    }
}

if (typeof window !== 'undefined') {
    window.validateCredentials = validateCredentials;
} else if (typeof global !== 'undefined') {
    global.validateCredentials = validateCredentials;
}

export { validateCredentials };
