/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/assets/js/partials/add-product-toast.js"
/*!*****************************************************!*\
  !*** ./src/assets/js/partials/add-product-toast.js ***!
  \*****************************************************/
() {

eval("{/**\r\n * Add-product toast entry.\r\n *\r\n * Webpack expects this file from the configured entries. The toast/notification\r\n * behavior is currently handled by the global notifier in app.js, so this entry\r\n * stays as a stable hook for any future isolated customizations.\r\n */\nfunction initAddProductToastEntry() {\n  // no-op by design\n}\nif (typeof salla !== 'undefined' && typeof salla.onReady === 'function') {\n  salla.onReady(function () {\n    return initAddProductToastEntry();\n  });\n} else {\n  initAddProductToastEntry();\n}\n\n//# sourceURL=webpack://theme-raed/./src/assets/js/partials/add-product-toast.js?\n}");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/assets/js/partials/add-product-toast.js"]();
/******/ 	
/******/ })()
;