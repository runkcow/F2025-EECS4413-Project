
let logout = null;

export function setLogout (func) { logout = func; }

function decodeJwt (token)
{
    try {
        const payload = token.split(".")[1];
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
}

function jwtExpired (token)
{
    if (!token) { return true; }
    const payload = decodeJwt(token);
    if (!payload || typeof payload.exp !== "number") { return true; }
    return payload.exp < Math.floor(Date.now() / 1000);
}

export async function apiFetch (token, url, payload)
{
    if (token !== undefined && jwtExpired(token)) { logout?.("Token Expired"); throw new Error("TOKEN_EXPIRED"); }
    const res = await fetch(url, payload);
    if (res.status === 401) { logout?.("Token Expired"); throw new Error("TOKEN_EXPIRED"); }
    return res;
}
