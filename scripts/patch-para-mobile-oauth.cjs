/**
 * Postinstall patch for Para SDK's AuthProvider.
 *
 * Problem: On mobile browsers, Para SDK uses `onOAuthPopup` which calls
 * `window.open()` — this always opens a NEW BROWSER TAB on mobile instead
 * of a popup, creating a broken UX where users get stuck in the new tab.
 *
 * Fix: On mobile, switch to `onOAuthUrl` (redirect-based OAuth) with
 * `appScheme` pointing back to our app. After OAuth completes, Para's
 * callback redirects the user back to our origin instead of trying
 * `window.close()` (which fails on mobile tabs).
 *
 * The `isMobile()` function is already imported in AuthProvider.js from
 * "@getpara/web-sdk", so no new imports are needed.
 */

const fs = require('fs');
const path = require('path');

const AUTH_PROVIDER_PATH = path.resolve(
  __dirname,
  '..',
  'node_modules',
  '@getpara',
  'react-sdk-lite',
  'dist',
  'provider',
  'providers',
  'AuthProvider.js'
);

const PATCH_MARKER = 'SENTI_MOBILE_OAUTH_PATCH';

function main() {
  if (!fs.existsSync(AUTH_PROVIDER_PATH)) {
    console.log('[patch-para-mobile-oauth] AuthProvider.js not found, skipping.');
    return;
  }

  let content = fs.readFileSync(AUTH_PROVIDER_PATH, 'utf8');

  if (content.includes(PATCH_MARKER)) {
    console.log('[patch-para-mobile-oauth] Already patched, skipping.');
    return;
  }

  // The exact code block we need to replace (from AuthProvider.js lines 470-494)
  const original = [
    '  const verifyOAuth = (method) => __async(this, null, function* () {',
    '    setStep(ModalStep.AWAITING_OAUTH);',
    '    mutateVerifyOAuth(',
    '      {',
    '        method,',
    '        onOAuthPopup: (oAuthPopup) => {',
    '          refs.popupWindow.current = oAuthPopup;',
    '        },',
    '        isCanceled: () => {',
    '          var _a;',
    '          return ((_a = refs.popupWindow.current) == null ? void 0 : _a.closed) || cancelIfExitedSteps([ModalStep.AWAITING_OAUTH]);',
    '        },',
    '        onPoll: () => {',
    '          goBackIfPopupClosedOnSteps([ModalStep.AWAITING_OAUTH]);',
    '        },',
    '        useShortUrls: true',
    '      },',
    '      {',
    '        onSuccess: onNewAuthState,',
    '        onError: () => {',
    '          goBackIfPopupClosedOnSteps([ModalStep.AWAITING_OAUTH]);',
    '        }',
    '      }',
    '    );',
    '  });',
  ].join('\n');

  const patched = [
    `  /* ${PATCH_MARKER} */`,
    '  const verifyOAuth = (method) => __async(this, null, function* () {',
    '    setStep(ModalStep.AWAITING_OAUTH);',
    '    if (isMobile()) {',
    '      // Mobile: redirect-based OAuth to prevent new-tab issue',
    '      try { sessionStorage.setItem("senti_oauth_pending", "true"); } catch (e) {}',
    '      mutateVerifyOAuth(',
    '        {',
    '          method,',
    '          appScheme: window.location.origin + window.location.pathname,',
    '          onOAuthUrl: (url) => {',
    '            window.location.href = url;',
    '          },',
    '          isCanceled: () => cancelIfExitedSteps([ModalStep.AWAITING_OAUTH]),',
    '          onPoll: () => {},',
    '          useShortUrls: true',
    '        },',
    '        {',
    '          onSuccess: onNewAuthState,',
    '          onError: () => {',
    '            goBackIfPopupClosedOnSteps([ModalStep.AWAITING_OAUTH]);',
    '          }',
    '        }',
    '      );',
    '    } else {',
    '      // Desktop: popup-based OAuth (default behavior)',
    '      mutateVerifyOAuth(',
    '        {',
    '          method,',
    '          onOAuthPopup: (oAuthPopup) => {',
    '            refs.popupWindow.current = oAuthPopup;',
    '          },',
    '          isCanceled: () => {',
    '            var _a;',
    '            return ((_a = refs.popupWindow.current) == null ? void 0 : _a.closed) || cancelIfExitedSteps([ModalStep.AWAITING_OAUTH]);',
    '          },',
    '          onPoll: () => {',
    '            goBackIfPopupClosedOnSteps([ModalStep.AWAITING_OAUTH]);',
    '          },',
    '          useShortUrls: true',
    '        },',
    '        {',
    '          onSuccess: onNewAuthState,',
    '          onError: () => {',
    '            goBackIfPopupClosedOnSteps([ModalStep.AWAITING_OAUTH]);',
    '          }',
    '        }',
    '      );',
    '    }',
    '  });',
  ].join('\n');

  if (!content.includes(original)) {
    console.warn(
      '[patch-para-mobile-oauth] WARNING: Could not find the expected code block in AuthProvider.js.'
    );
    console.warn(
      '[patch-para-mobile-oauth] The Para SDK version may have changed. Patch skipped.'
    );
    console.warn(
      '[patch-para-mobile-oauth] Mobile OAuth will fall back to default popup behavior.'
    );
    return;
  }

  content = content.replace(original, patched);
  fs.writeFileSync(AUTH_PROVIDER_PATH, content, 'utf8');
  console.log(
    '[patch-para-mobile-oauth] Successfully patched AuthProvider.js for mobile OAuth redirect.'
  );
}

main();
