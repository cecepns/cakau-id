import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  BackHandler,
  Platform,
  Linking,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const WEB_URL = 'https://cakau-id.vercel.app/';

function MainApp() {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(1);

  // Pull to refresh state
  const [refreshing, setRefreshing] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);

  // Top progress bar state (no persistent bottom spinner)
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setHasError(false);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
    // Safety fallback timeout
    setTimeout(() => {
      setRefreshing(false);
    }, 2500);
  }, []);

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setProgress(0.1);
    setKey((prev) => prev + 1);
  };

  // Injected JS for scroll detection and Service Worker updates
  const injectedJavaScript = `
    (function() {
      // 1. Force service worker update check
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(regs) {
          for (var r of regs) {
            r.update();
          }
        });
      }

      // 2. Detect scroll position for reliable pull-to-refresh
      var lastAtTop = true;
      function checkScroll() {
        var top = window.scrollY || document.documentElement.scrollTop || 0;
        var atTop = top <= 2;
        if (atTop !== lastAtTop) {
          lastAtTop = atTop;
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'SCROLL_POSITION',
              isAtTop: atTop
            }));
          }
        }
      }

      window.addEventListener('scroll', checkScroll, { passive: true });
      document.addEventListener('scroll', checkScroll, { passive: true });
    })();
    true;
  `;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data && data.type === 'SCROLL_POSITION') {
        setIsAtTop(data.isAtTop);
      }
    } catch (_) {}
  };

  return (
    <View
      style={[
        styles.safeArea,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
        translucent={false}
      />

      {/* Slim Top Progress Bar (Replaces persistent bottom spinner) */}
      {isLoading && progress < 1 && (
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.max(progress * 100, 10)}%` },
            ]}
          />
        </View>
      )}

      <View style={styles.container}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContainer}
          scrollEnabled={isAtTop}
          bounces={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              enabled={isAtTop}
              colors={['#047857']}
              tintColor="#047857"
              progressViewOffset={10}
            />
          }
        >
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
            // Scroll handling for Pull-To-Refresh
            onScroll={(e) => {
              const y = e.nativeEvent.contentOffset.y;
              if (y <= 2) {
                setIsAtTop(true);
              } else if (isAtTop) {
                setIsAtTop(false);
              }
            }}
            // Navigation & Progress
            onNavigationStateChange={(navState) => {
              setCanGoBack(navState.canGoBack);
            }}
            onLoadProgress={({ nativeEvent }) => {
              setProgress(nativeEvent.progress);
              if (nativeEvent.progress >= 1) {
                setIsLoading(false);
                setRefreshing(false);
              }
            }}
            onLoadStart={() => {
              setIsLoading(true);
              setHasError(false);
            }}
            onLoadEnd={() => {
              setIsLoading(false);
              setRefreshing(false);
            }}
            onError={() => {
              setIsLoading(false);
              setRefreshing(false);
              setHasError(true);
            }}
            onHttpError={(syntheticEvent) => {
              const { statusCode } = syntheticEvent.nativeEvent;
              if (statusCode >= 500) {
                setHasError(true);
              }
            }}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            onMessage={handleMessage}
            injectedJavaScript={injectedJavaScript}
            style={styles.webview}
          />
        </ScrollView>

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
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
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
  scrollContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  progressBarTrack: {
    height: 3,
    backgroundColor: '#e2e8f0',
    width: '100%',
    overflow: 'hidden',
    zIndex: 99,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#047857',
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
