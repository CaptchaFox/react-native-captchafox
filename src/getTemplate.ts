import type { WidgetOptions } from '@captchafox/types';

export const getTemplate = ({
  mode,
  lang,
  theme,
  sitekey,
}: Pick<WidgetOptions, 'mode' | 'theme' | 'lang' | 'sitekey'>) => {
  return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="preconnect" href="https://api.captchafox.com">
          <script async defer src="https://cdn.captchafox.com/api.js?render=explicit&onload=onLoad"></script>
          <style>
            .content {
              position: absolute;
              left: 50%;
              top: 50%;
              -webkit-transform: translate(-50%, -50%);
              transform: translate(-50%, -50%);
            }
          </style>
        </head>

        <body style="background-color: transparent;">
          <div class="content captchafox"></div>
          <script>
            function onVerify(token) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'VERIFY',
                token: token
              }));
            }

            function onError(error) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'ERROR',
                error: error.message || 'CaptchaFox execution failed'
              }));
            }

            function onFail() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'FAIL',
              }));
            }

            function onClose() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'CLOSE',
              }));
            }

            function onExpire() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'EXPIRED',
              }));
            }

            function onChallengeOpen() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'OPEN',
              }));
            }

            async function onLoad() {
              try {
                await window.captchafox.render('.captchafox', {
                  sitekey: "${sitekey}",
                  mode: "${mode}",
                  theme: "${theme}",
                  lang: "${lang}",
                  onFail,
                  onClose,
                  onExpire,
                  onError,
                  onVerify,
                  onChallengeOpen,
                });
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'LOAD',
                }));
              } catch(e) {
                onError(e)
              }
            }
          </script>
        </body>
      </html>
    `;
};
