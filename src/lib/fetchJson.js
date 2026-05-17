/**
 * Fetches a JSON resource with a single automatic retry on failure.
 *
 * @param {string} url
 * @param {{ retries?: number, backoffMs?: number }} [options]
 * @returns {Promise<any>}
 */
export async function fetchWithRetry(url, { retries = 1, backoffMs = 500 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.json();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
