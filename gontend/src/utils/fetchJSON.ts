function fetchJSON<T = object>(url: string, options?: Partial<RequestInit>): Promise<T> {
  return window.fetch(url, { credentials: 'same-origin', ...options }).then((r) => r.json());
}

export default fetchJSON;
