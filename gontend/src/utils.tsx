export const fetchJSON = (url: string, options?: Partial<RequestInit>): Promise<object> => (
  fetch(url, {credentials: 'same-origin', ...options})
    .then(r => r.json())
);
