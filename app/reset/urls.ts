const PORTAL_HOSTS = new Set(['scxdashboards.com', 'www.scxdashboards.com']);

/** Sites that may send the customer back after a reset payment. */
const TRADING_HOSTS = ['shockwavetrading.com', 'shockwave-capital.com'];

function isTradingHost(host: string): boolean {
  return TRADING_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

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
  return isTradingHost(host);
}

function assertResetRedirectHosts() {
  const allowed = [
    'https://shockwavetrading.com/dashboard/accounts?reset=paid',
    'https://www.shockwavetrading.com/dashboard/accounts',
    'https://shockwave-capital.com/dashboard/accounts?reset=paid',
    'https://www.shockwave-capital.com/dashboard/accounts',
    'http://localhost:3000/dashboard/accounts',
  ];
  const refused = [
    'https://evil.example/dashboard/accounts',
    'https://www.scxdashboards.com/reset',
    'http://shockwavetrading.com/dashboard/accounts',
    'https://shockwavetrading.com.evil.example/dashboard/accounts',
  ];
  for (const url of allowed) {
    if (!isAllowedResetRedirect(url)) throw new Error(`Reset redirect should allow ${url}`);
  }
  for (const url of refused) {
    if (isAllowedResetRedirect(url)) throw new Error(`Reset redirect should refuse ${url}`);
  }
}

assertResetRedirectHosts();
