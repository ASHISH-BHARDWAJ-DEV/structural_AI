/**
 * Recursively sorts the keys of an object to ensure deterministic JSON stringification.
 * @param {any} obj - The data to sort.
 * @returns {any} - The data with sorted keys.
 */
const sortObjectKeys = (obj) => {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }

  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = sortObjectKeys(obj[key]);
      return acc;
    }, {});
};

/**
 * Generates a SHA-256 hash of the given report data.
 * 
 * This function:
 * 1. Converts the report data into a deterministic JSON string (canonical form).
 * 2. Uses the native Web Crypto API (SubtleCrypto) to generate a SHA-256 hash.
 * 3. Returns the resulting hash as a hex string.
 * 
 * @param {Object} reportData - The JSON report data to hash.
 * @returns {Promise<string>} - A promise that resolves to the SHA-256 hash as a hex string.
 */
export const generateReportHash = async (reportData) => {
  if (!reportData) {
    throw new Error('No report data provided for hashing.');
  }

  // 1. Create a deterministic string representation by sorting keys
  const deterministicData = sortObjectKeys(reportData);
  const canonicalJson = JSON.stringify(deterministicData);

  // 2. Convert string to BufferSource (Uint8Array)
  const encoder = new TextEncoder();
  const data = encoder.encode(canonicalJson);

  // 3. Hash the data using SHA-256 via Web Crypto API
  // Note: window.crypto.subtle.digest is only available in secure contexts (HTTPS or localhost)
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);

  // 4. Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return hashHex;
};
