
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { generateInitialBoard, isValidWord } from '@/utils/gameLogic';
import { validateWord } from '@/utils/wordMechanics';

export default function DiagnosticsScreen() {
  const router = useRouter();
  const [boardGenTest, setBoardGenTest] = useState<string>('Not tested');
  const [dictionaryTest, setDictionaryTest] = useState<string>('Not tested');
  const [testWords, setTestWords] = useState<Array<{ word: string; valid: boolean }>>([]);
  const [boardSize, setBoardSize] = useState<number>(0);
  const [tileCount, setTileCount] = useState<number>(0);

  useEffect(() => {
    runDiagnostics();
  }, []);

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

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ About Diagnostics</Text>
          <Text style={styles.infoText}>
            This screen tests core VERBLOC systems to ensure the game works correctly.
            All tests should show ✅ PASS for the game to function properly.
          </Text>
          <Text style={styles.infoText}>
            If any tests fail, check the console logs for detailed error messages.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
});
