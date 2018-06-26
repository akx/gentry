function fetchJSON<T = object>(url: string, options?: Partial<RequestInit>): Promise<T> {
  return (
    fetch(url, {credentials: 'same-origin', ...options})
      .then(r => r.json())
  );
}

export {fetchJSON};
