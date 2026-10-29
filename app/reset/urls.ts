const PORTAL_HOSTS = new Set(['scxdashboards.com', 'www.scxdashboards.com']);

/** Shockwave return and cancel URLs. Refuses any other host. */
export function isAllowedResetRedirect(value: string): boolean {
  if (!value || value.length > 500) return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.username || url.password) return false;
  const host = url.hostname.toLowerCase();
  if (!/^[a-z0-9.-]+$/.test(host) || PORTAL_HOSTS.has(host)) return false;
  const local = host === 'localhost' || host === '127.0.0.1';
  if (local) return url.protocol === 'http:' || url.protocol === 'https:';
  if (url.protocol !== 'https:') return false;
  return host === 'shockwave-capital.com' || host.endsWith('.shockwave-capital.com');
}
