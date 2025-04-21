import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  CaptchaFox,
  type CaptchaFoxProps,
  type CaptchaFoxRef,
} from './CaptchaFox';

export type CaptchaFoxModalRef = {
  show: () => void;
  hide: () => void;
};

export type CaptchaFoxModalProps = Omit<
  CaptchaFoxProps,
  'onChallengeOpen' | 'containerStyle'
> & {
  /** Custom loading indicator. */
  loadingComponent?: ReactNode;
  /** Custom header. */
  headerComponent?: ReactNode;
  /** Custom footer. */
  footerComponent?: ReactNode;
  /** Custom styles for the Modal. */
  modalStyle?: StyleProp<ViewStyle>;
  /** Color of the modal backdrop. */
  backdropColor?: string;
};

export const CaptchaFoxModal = forwardRef<
  CaptchaFoxModalRef,
  CaptchaFoxModalProps
>(
  (
    {
      siteKey,
      mode,
      theme,
      lang,
      baseUrl,
      style,
      loadingComponent,
      headerComponent,
      footerComponent,
      modalStyle,
      backdropColor = 'rgba(0,0,0,0.6)',
      onVerify,
      onError,
      onExpire,
      onClose,
      onFail,
      onLoad,
    },
    ref
  ) => {
    const [isOpen, setOpen] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const captchaRef = useRef<CaptchaFoxRef>(null);

    const isHiddenMode = mode === 'hidden';

    useImperativeHandle(ref, () => ({
      show: () => {
        setLoading(true);
        setOpen(true);
      },
      hide: () => {
        dismissModal();
      },
    }));

    const dismissModal = () => {
      onClose?.();
      setLoading(false);
      setOpen(false);
    };

    return (
      <Modal
        transparent
        animationType="fade"
        visible={isOpen}
        style={[styles.modal, modalStyle]}
        onRequestClose={dismissModal}
      >
        <SafeAreaView
          style={[styles.wrapper, { backgroundColor: backdropColor }]}
        >
          {headerComponent}
          <CaptchaFox
            ref={captchaRef}
            containerStyle={[styles.webView, { opacity: isLoading ? 0 : 1 }]}
            siteKey={siteKey}
            mode={mode}
            theme={theme}
            lang={lang}
            baseUrl={baseUrl}
            style={style}
            onChallengeOpen={() => {
              if (!isHiddenMode) return;
              setLoading(false);
            }}
            onVerify={async (token) => {
              onVerify?.(token);
              await new Promise((r) => setTimeout(r, 500)); // visual delay
              setOpen(false);
            }}
            onLoad={() => {
              onLoad?.();

              if (isHiddenMode) {
                captchaRef.current?.startExecute();
              } else {
                setLoading(false);
              }
            }}
            onError={(e) => {
              onError?.(e);
              setLoading(false);
              setOpen(false);
            }}
            onFail={onFail}
            onExpire={onExpire}
            onClose={() => {
              onClose?.();

              if (isHiddenMode) {
                setOpen(false);
              }
            }}
          />
          {isLoading && (
            <View style={styles.loadingContainer}>
              {loadingComponent || <ActivityIndicator size="large" />}
            </View>
          )}
          {footerComponent}
        </SafeAreaView>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  webView: {
    flex: 1,
  },
  modal: {
    margin: 0,
  },
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});
