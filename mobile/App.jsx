import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  BackHandler,
  Platform,
  Linking,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';

const WEB_URL = 'https://cakau-id.vercel.app/';

export default function App() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(1);

  // Hardware back button handler on Android
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );
    return () => subscription.remove();
  }, [canGoBack]);

  // Handle external schemes like WhatsApp, tel, mailto, maps
  const handleShouldStartLoad = useCallback((request) => {
    const { url } = request;
    if (!url) return true;

    const isExternalScheme =
      url.startsWith('whatsapp://') ||
      url.startsWith('https://wa.me/') ||
      url.startsWith('https://api.whatsapp.com/') ||
      url.startsWith('tel:') ||
      url.startsWith('mailto:') ||
      url.startsWith('sms:') ||
      url.startsWith('geo:') ||
      url.startsWith('intent:');

    if (isExternalScheme) {
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            Linking.openURL(url);
          } else if (url.startsWith('whatsapp://') || url.startsWith('https://wa.me/')) {
            Linking.openURL(url).catch(() => {});
          }
        })
        .catch(() => {});
      return false;
    }

    return true;
  }, []);

  const handleRetry = () => {
    setHasError(false);
    setLoading(true);
    setKey((prev) => prev + 1);
  };

  // Injected JS to ensure Service Workers & dynamic updates check immediately
  const injectedJavaScript = `
    (function() {
      // Force service worker update check if present
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(regs) {
          for (var r of regs) {
            r.update();
          }
        });
      }
    })();
    true;
  `;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
        translucent={false}
      />

      <View style={styles.container}>
        <WebView
          key={key}
          ref={webViewRef}
          source={{
            uri: WEB_URL,
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              Pragma: 'no-cache',
              Expires: '0',
            },
          }}
          // Anti-Cache & Auto Update Settings
          cacheEnabled={false}
          cacheMode="LOAD_NO_CACHE"
          incognito={false}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
          // Features & Hardware capabilities
          javaScriptEnabled={true}
          domStorageEnabled={true}
          geolocationEnabled={true}
          allowFileAccess={true}
          allowFileAccessFromFileURLs={true}
          allowUniversalAccessFromFileURLs={true}
          allowsFullscreenVideo={true}
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode="always"
          // Navigation & Loading
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
          onLoadStart={() => {
            setLoading(true);
            setHasError(false);
          }}
          onLoadEnd={() => {
            setLoading(false);
          }}
          onError={() => {
            setLoading(false);
            setHasError(true);
          }}
          onHttpError={(syntheticEvent) => {
            const { statusCode } = syntheticEvent.nativeEvent;
            if (statusCode >= 400) {
              // Only flag error on primary page failure
            }
          }}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          injectedJavaScript={injectedJavaScript}
          style={styles.webview}
        />

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#047857" />
          </View>
        )}

        {/* Offline / Error Screen */}
        {hasError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Koneksi Terputus</Text>
            <Text style={styles.errorMessage}>
              Gagal memuat halaman Cakau ID. Periksa koneksi internet Anda.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  retryButton: {
    backgroundColor: '#047857',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#047857',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
