/**
 * Digital files page entry.
 *
 * This file is intentionally lightweight and exists because it is referenced
 * directly by webpack entries. Keep it as the extension point for any future
 * digital-files page enhancements.
 */
function initDigitalFilesEntry() {
  // no-op by design
}

if (typeof salla !== 'undefined' && typeof salla.onReady === 'function') {
  salla.onReady(() => initDigitalFilesEntry());
} else {
  initDigitalFilesEntry();
}

