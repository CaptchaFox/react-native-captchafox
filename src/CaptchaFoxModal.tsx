import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Modal from 'react-native-modal';
import {
  CaptchaFox,
  type CaptchaFoxProps,
  type CaptchaFoxRefAttributes,
} from './CaptchaFox';

const { width, height } = Dimensions.get('window');

export type CaptchaFoxModalRefAttributes = {
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
};

export const CaptchaFoxModal = forwardRef<
  CaptchaFoxModalRefAttributes,
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
    const captchaRef = useRef<CaptchaFoxRefAttributes>(null);

    const isHiddenMode = mode === 'hidden';

    useImperativeHandle(ref, () => ({
      show: () => {
        setLoading(true);
        setOpen(true);
      },
      hide: () => {
        setLoading(false);
        setOpen(false);
      },
    }));

    return (
      <Modal
        useNativeDriver
        useNativeDriverForBackdrop
        hideModalContentWhileAnimating
        deviceHeight={height}
        deviceWidth={width}
        style={[styles.modal, modalStyle]}
        animationIn="fadeIn"
        animationOut="fadeOut"
        onBackdropPress={() => {
          setOpen(false);
        }}
        onBackButtonPress={() => setOpen(false)}
        isVisible={isOpen}
        backdropTransitionOutTiming={1}
        hasBackdrop
        coverScreen
      >
        <SafeAreaView style={styles.wrapper}>
          {headerComponent}
          <CaptchaFox
            ref={captchaRef}
            containerStyle={styles.webView}
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
    pointerEvents: 'box-none',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
