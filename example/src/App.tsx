import {
  CaptchaFoxModal,
  type CaptchaFoxModalRef,
} from '@captchafox/react-native';
import { useRef, useState } from 'react';
import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function App() {
  const [token, setToken] = useState<string>();
  const confirmRef = useRef<CaptchaFoxModalRef>(null);

  return (
    <SafeAreaView style={styles.container}>
      <Button
        title="Start verification"
        onPress={() => confirmRef?.current?.show()}
      />
      <CaptchaFoxModal
        ref={confirmRef}
        baseUrl="https://example.com"
        mode="hidden"
        siteKey="sk_11111111000000001111111100000000"
        onVerify={(token) => {
          console.log('Verified:', token);
          setToken(token);
        }}
        onError={(error) => console.error('Error:', error)}
        headerComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Complete Verification to continue
            </Text>
          </View>
        }
      />
      {token && <Text style={styles.code}>Token: {token}</Text>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  code: {
    fontFamily: 'Courier',
    color: 'darkorange',
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: 300,
    fontSize: 14,
  },
  header: {
    backgroundColor: 'steelblue',
    padding: 16,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
});
