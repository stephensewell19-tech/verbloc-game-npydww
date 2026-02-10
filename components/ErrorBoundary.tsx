
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { router } from 'expo-router';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('[ErrorBoundary] Caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Error details:', error, errorInfo);
  }

  handleReload = async () => {
    console.log('[ErrorBoundary] Reloading app...');
    try {
      // Only use expo-updates on native platforms
      if (Platform.OS !== 'web') {
        try {
          // Dynamic import to prevent 'Unable to resolve path to module' error
          const Updates = await import('expo-updates');
          await Updates.reloadAsync();
        } catch (importError) {
          console.error('[ErrorBoundary] expo-updates not available:', importError);
          // Fallback: Reset error state to try again
          this.setState({ hasError: false, error: null });
        }
      } else {
        // On web, just reload the page
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }
    } catch (err) {
      console.error('[ErrorBoundary] Reload failed:', err);
      // Fallback: Reset error state to try again
      this.setState({ hasError: false, error: null });
    }
  };

  handleGoHome = () => {
    console.log('[ErrorBoundary] Navigating to home...');
    try {
      this.setState({ hasError: false, error: null });
      router.replace('/(tabs)/(home)');
    } catch (err) {
      console.error('[ErrorBoundary] Navigation failed:', err);
    }
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'An unexpected error occurred';
      
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>😔</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{errorMessage}</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={this.handleReload}>
              <Text style={styles.buttonText}>Reload App</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={this.handleGoHome}>
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Go Home</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.hint}>
            If this problem persists, please restart the app completely.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.background,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 24,
    textAlign: 'center',
  },
});
