import type { WidgetOptions } from '@captchafox/types';
import React, { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { getTemplate } from './getTemplate';

export type CaptchaFoxProps = Omit<WidgetOptions, 'i18n' | 'sitekey'> & {
  /** The sitekey for the widget. */
  siteKey: string;
  /** The URL that is used for the WebView. Must contain the domain set up in the captcha config. */
  baseUrl?: string;
  /** Custom styles for the WebView. */
  style?: StyleProp<ViewStyle>;
  /** Custom styles for the WebView container. */
  containerStyle?: StyleProp<ViewStyle>;
  /** Called after the widget has been loaded. */
  onLoad?: () => void;
  /** Called when a challenge is required (hidden). */
  onChallengeOpen?: () => void;
};

export type CaptchaFoxRefAttributes = {
  /** Returns captcha token after successful verification. */
  getToken: () => Promise<string | null>;
  /** Resets the captcha widget. */
  reset: () => void;
  /** (internal) Starts the execute process without awaiting the response. */
  startExecute: () => void;
};

type CaptchaFoxMessage = {
  type: 'VERIFY' | 'ERROR' | 'LOAD' | 'FAIL' | 'EXPIRE' | 'CLOSE' | 'OPEN';
  token?: string;
  error?: string;
};

export const CaptchaFox = forwardRef<CaptchaFoxRefAttributes, CaptchaFoxProps>(
  (
    {
      siteKey,
      mode,
      lang,
      theme,
      baseUrl = 'https://example.com',
      containerStyle,
      style,
      onVerify,
      onError,
      onClose,
      onFail,
      onLoad,
      onExpire,
      onChallengeOpen,
    },
    ref
  ) => {
    const webViewRef = React.useRef<WebView>(null);
    const tokenPromiseRef = React.useRef<{
      resolve: (value: string | null) => void;
      reject: (reason?: any) => void;
    } | null>(null);
    const htmlContent = getTemplate({ mode, lang, theme, sitekey: siteKey });

    useImperativeHandle(ref, () => ({
      reset: () => {
        const jsToInject = `
          (function resetCaptcha() {
            if (window.captchafox) {
              window.captchafox.reset()
            } else {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'ERROR',
                error: 'CaptchaFox not ready'
              }));
            }
          })();
        `;
        webViewRef.current?.injectJavaScript(jsToInject);
      },
      getToken: () => {
        return new Promise((resolve, reject) => {
          tokenPromiseRef.current = { resolve, reject };
          const jsToInject = `
            (function executeCaptcha() {
              if (window.captchafox) {
                window.captchafox.execute()
                  .then(token => {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'VERIFY',
                      token: token
                    }));
                  })
                  .catch(error => {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'ERROR',
                      error: error || 'CaptchaFox execution failed'
                    }));
                  });
              } else {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'ERROR',
                  error: 'CaptchaFox not ready'
                }));
              }
            })();
          `;
          webViewRef.current?.injectJavaScript(jsToInject);
        });
      },
      startExecute: () => {
        const jsToInject = `
          (function executeCaptcha() {
            if (window.captchafox) {
              window.captchafox.execute('${siteKey}')
                .catch(error => {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'ERROR',
                    error: error || 'CaptchaFox execution failed'
                  }));
                });
            } else {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'ERROR',
                error: 'CaptchaFox not ready'
              }));
            }
          })();
        `;
        webViewRef.current?.injectJavaScript(jsToInject);
      },
    }));

    const parseMessage = (event: WebViewMessageEvent) => {
      try {
        const data: CaptchaFoxMessage = JSON.parse(event.nativeEvent.data);
        console.log(data);
        switch (data.type) {
          case 'VERIFY': {
            if (!data.token) {
              return;
            }

            onVerify?.(data.token);
            tokenPromiseRef.current?.resolve(data.token);
            break;
          }
          case 'ERROR': {
            const errorMessage = data.error || 'CaptchaFox error';
            onError?.(errorMessage);
            tokenPromiseRef.current?.reject(new Error(errorMessage));
            break;
          }
          case 'LOAD': {
            onLoad?.();
            break;
          }
          case 'CLOSE': {
            onClose?.();
            break;
          }
          case 'FAIL': {
            onFail?.();
            break;
          }
          case 'EXPIRE': {
            onExpire?.();
            break;
          }
          case 'OPEN': {
            onChallengeOpen?.();
            break;
          }
        }
      } catch (error) {
        const errorMessage = 'Failed to parse CaptchaFox response';
        onError?.(errorMessage);
        tokenPromiseRef.current?.reject(error);
      } finally {
        tokenPromiseRef.current = null;
      }
    };

    return (
      <WebView
        ref={webViewRef}
        source={{
          html: htmlContent,
          baseUrl,
        }}
        onMessage={parseMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        style={[styles.webview, style]}
        automaticallyAdjustContentInsets={true}
        mixedContentMode={'always'}
        containerStyle={[styles.container, containerStyle]}
      />
    );
  }
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    width: '100%',
  },
  webview: {
    backgroundColor: 'transparent',
  },
});
