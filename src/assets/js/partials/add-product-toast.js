/**
 * Add-product toast entry.
 *
 * Webpack expects this file from the configured entries. The toast/notification
 * behavior is currently handled by the global notifier in app.js, so this entry
 * stays as a stable hook for any future isolated customizations.
 */
function initAddProductToastEntry() {
  // no-op by design
}

if (typeof salla !== 'undefined' && typeof salla.onReady === 'function') {
  salla.onReady(() => initAddProductToastEntry());
} else {
  initAddProductToastEntry();
}

