
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { generateInitialBoard, isValidWord } from '@/utils/gameLogic';
import { validateWord } from '@/utils/wordMechanics';
import { getBreadcrumbs, getGameState, clearBreadcrumbs, clearGameState } from '@/utils/errorLogger';
import Constants from 'expo-constants';

interface TestWord {
  word: string;
  valid: boolean;
}

export default function DiagnosticsScreen() {
  const router = useRouter();
  const [boardGenTest, setBoardGenTest] = useState<string>('Not tested');
  const [dictionaryTest, setDictionaryTest] = useState<string>('Not tested');
  const [testWords, setTestWords] = useState<TestWord[]>([]);
  const [boardSize, setBoardSize] = useState<number>(0);
  const [tileCount, setTileCount] = useState<number>(0);
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);
  const [gameState, setGameState] = useState<any>(null);
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(false);

  useEffect(() => {
    runDiagnostics();
    loadCrashData();
  }, []);

  function loadCrashData() {
    const crumbs = getBreadcrumbs();
    setBreadcrumbs(crumbs);
    
    const state = getGameState();
    setGameState(state);
    
    console.log('[Diagnostics] Loaded', crumbs.length, 'breadcrumbs');
  }
  
  async function handleExportLogs() {
    try {
      const logData = {
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
        gameState,
        breadcrumbs,
        appVersion: Constants.expoConfig?.version || 'unknown',
        diagnostics: {
          boardGenTest,
          dictionaryTest,
          boardSize,
          tileCount,
        },
      };
      
      const logText = JSON.stringify(logData, null, 2);
      
      await Share.share({
        message: logText,
        title: 'Verbloc Crash Logs',
      });
    } catch (err) {
      console.error('Failed to export logs:', err);
    }
  }
  
  function handleClearLogs() {
    clearBreadcrumbs();
    clearGameState();
    setBreadcrumbs([]);
    setGameState(null);
    console.log('[Diagnostics] Logs cleared');
  }

  function runDiagnostics() {
    console.log('[Diagnostics] Running diagnostics...');

    // Test 1: Board Generation
    try {
      const board = generateInitialBoard(7);
      const tiles = board.tiles.flat();
      const validTiles = tiles.filter(t => t && t.letter).length;
      
      setBoardSize(board.size);
      setTileCount(validTiles);
      
      if (validTiles === board.size * board.size) {
        setBoardGenTest(`✅ PASS - ${validTiles}/${board.size * board.size} tiles generated`);
      } else {
        setBoardGenTest(`❌ FAIL - Only ${validTiles}/${board.size * board.size} tiles generated`);
      }
    } catch (err) {
      setBoardGenTest(`❌ ERROR - ${err}`);
    }

    // Test 2: Dictionary Validation
    const testWordsList = [
      'CAT', 'DOG', 'BOX', 'WORD', 'GAME', 'PLAY',
      'QZX', 'ZZZZZ', 'INVALID', 'XYZ'
    ];

    const results = testWordsList.map(word => ({
      word,
      valid: validateWord(word)
    }));

    setTestWords(results);

    const validCount = results.filter(r => r.valid).length;
    if (validCount >= 6) {
      setDictionaryTest(`✅ PASS - ${validCount}/${testWordsList.length} common words recognized`);
    } else {
      setDictionaryTest(`❌ FAIL - Only ${validCount}/${testWordsList.length} common words recognized`);
    }

    console.log('[Diagnostics] Diagnostics complete');
    loadCrashData();
  }

  function handleTestWord() {
    const testWord = 'CAT';
    const isValid = isValidWord(testWord);
    console.log('[Diagnostics] Test word "CAT" validation:', isValid);
    alert(`Word "${testWord}" is ${isValid ? 'VALID' : 'INVALID'}`);
  }

  function handleGenerateBoard() {
    try {
      const board = generateInitialBoard(7);
      console.log('[Diagnostics] Generated board:', board);
      alert(`Board generated successfully with ${board.tiles.flat().length} tiles`);
    } catch (err) {
      console.error('[Diagnostics] Board generation failed:', err);
      alert(`Board generation failed: ${err}`);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'VERBLOC Diagnostics',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <IconSymbol
                ios_icon_name="chevron.left"
                android_material_icon_name="arrow-back"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 System Diagnostics</Text>
          <Text style={styles.sectionSubtitle}>Core game systems status</Text>
        </View>

        <View style={styles.testCard}>
          <Text style={styles.testTitle}>Board Generation</Text>
          <Text style={styles.testResult}>{boardGenTest}</Text>
          <View style={styles.testDetails}>
            <Text style={styles.detailText}>Board Size: {boardSize}x{boardSize}</Text>
            <Text style={styles.detailText}>Tiles Generated: {tileCount}</Text>
          </View>
        </View>

        <View style={styles.testCard}>
          <Text style={styles.testTitle}>Dictionary Validation</Text>
          <Text style={styles.testResult}>{dictionaryTest}</Text>
          <View style={styles.testDetails}>
            {testWords.map((item, index) => (
              <View key={index} style={styles.wordTestRow}>
                <Text style={styles.wordText}>{item.word}</Text>
                <Text style={[styles.wordResult, item.valid ? styles.wordValid : styles.wordInvalid]}>
                  {item.valid ? '✅ Valid' : '❌ Invalid'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 Manual Tests</Text>
        </View>

        <TouchableOpacity style={styles.actionButton} onPress={handleTestWord}>
          <IconSymbol
            ios_icon_name="checkmark.circle"
            android_material_icon_name="check-circle"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.actionButtonText}>Test Word Validation</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleGenerateBoard}>
          <IconSymbol
            ios_icon_name="square.grid.3x3"
            android_material_icon_name="grid-on"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.actionButtonText}>Generate Test Board</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={runDiagnostics}>
          <IconSymbol
            ios_icon_name="arrow.clockwise"
            android_material_icon_name="refresh"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.actionButtonText}>Re-run Diagnostics</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🐛 Crash Diagnostics</Text>
          <Text style={styles.sectionSubtitle}>Track user actions and game state for debugging</Text>
        </View>

        {gameState && (
          <View style={styles.testCard}>
            <Text style={styles.testTitle}>Current Game State</Text>
            <View style={styles.testDetails}>
              <Text style={styles.detailText}>Screen: {gameState.screen}</Text>
              <Text style={styles.detailText}>Mode: {gameState.mode || 'N/A'}</Text>
              <Text style={styles.detailText}>Round: {gameState.round}</Text>
              <Text style={styles.detailText}>Score: {gameState.score}</Text>
              <Text style={styles.detailText}>Turns Left: {gameState.turnsLeft}</Text>
              <Text style={styles.detailText}>Selected Tiles: {gameState.selectedTiles}</Text>
              <Text style={styles.detailText}>Last Action: {gameState.lastAction}</Text>
              <Text style={styles.detailText}>Timestamp: {new Date(gameState.timestamp).toLocaleString()}</Text>
            </View>
          </View>
        )}

        <View style={styles.testCard}>
          <View style={styles.breadcrumbHeader}>
            <Text style={styles.testTitle}>Breadcrumbs ({breadcrumbs.length})</Text>
            <TouchableOpacity onPress={() => setShowBreadcrumbs(!showBreadcrumbs)}>
              <Text style={styles.toggleText}>{showBreadcrumbs ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          {showBreadcrumbs && (
            <ScrollView style={styles.breadcrumbList} nestedScrollEnabled>
              {breadcrumbs.slice(-50).reverse().map((crumb, index) => (
                <View key={index} style={styles.breadcrumbItem}>
                  <View style={styles.breadcrumbHeader}>
                    <Text style={[styles.breadcrumbType, { color: getBreadcrumbColor(crumb.type) }]}>
                      {crumb.type.toUpperCase()}
                    </Text>
                    <Text style={styles.breadcrumbTime}>
                      {new Date(crumb.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                  <Text style={styles.breadcrumbMessage}>{crumb.message}</Text>
                  {crumb.data && Object.keys(crumb.data).length > 0 && (
                    <Text style={styles.breadcrumbData}>
                      {JSON.stringify(crumb.data, null, 2)}
                    </Text>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={handleExportLogs}>
            <IconSymbol
              ios_icon_name="square.and.arrow.up"
              android_material_icon_name="share"
              size={20}
              color={colors.text}
            />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Export Logs</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleClearLogs}>
            <IconSymbol
              ios_icon_name="trash"
              android_material_icon_name="delete"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.actionButtonText}>Clear Logs</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ About Diagnostics</Text>
          <Text style={styles.infoText}>
            This screen tests core VERBLOC systems to ensure the game works correctly.
            All tests should show ✅ PASS for the game to function properly.
          </Text>
          <Text style={styles.infoText}>
            Breadcrumbs track the last 100 user actions and game state changes to help diagnose crashes.
            Export logs to share with support if you experience issues.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getBreadcrumbColor(type: string): string {
  switch (type) {
    case 'action':
      return colors.primary;
    case 'state':
      return colors.success;
    case 'navigation':
      return colors.accent;
    case 'timer':
      return '#F59E0B';
    case 'network':
      return '#8B5CF6';
    case 'error':
      return colors.error;
    default:
      return colors.textSecondary;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  headerButton: {
    padding: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  testCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  testResult: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  testDetails: {
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  wordTestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  wordText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  wordResult: {
    fontSize: 14,
  },
  wordValid: {
    color: colors.success,
  },
  wordInvalid: {
    color: colors.error,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  breadcrumbHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  breadcrumbList: {
    maxHeight: 400,
  },
  breadcrumbItem: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  breadcrumbType: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  breadcrumbTime: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  breadcrumbMessage: {
    fontSize: 14,
    color: colors.text,
    marginTop: 4,
  },
  breadcrumbData: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text,
  },
  dangerButton: {
    backgroundColor: colors.error,
  },
});
