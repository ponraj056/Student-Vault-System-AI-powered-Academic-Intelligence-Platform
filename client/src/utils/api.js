export function apiFetch(url, options = {}) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const headers = new Headers(options.headers || {});
  if (user?.token) headers.set('Authorization', `Bearer ${user.token}`);
  return fetch(url, { ...options, headers });
}
