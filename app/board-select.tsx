
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { BoardListItem, PlayMode, Difficulty, PuzzleMode } from '@/types/game';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { Modal } from '@/components/button';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export default function BoardSelectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mode = (params.mode as PlayMode) || 'Solo';

  const [boards, setBoards] = useState<BoardListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>('All');
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });

  useEffect(() => {
    loadBoards();
  }, [selectedDifficulty]); // loadBoards is stable, no need to include

  const loadBoards = async () => {
    console.log('[BoardSelect] Loading boards for mode:', mode, 'difficulty:', selectedDifficulty);
    setLoading(true);
    
    try {
      // TODO: Backend Integration - GET /api/boards with query params: mode, difficulty
      // For now, use mock data
      const mockBoards: BoardListItem[] = [
        {
          id: '1',
          name: 'Vault Breaker',
          supportedModes: ['Solo', 'Multiplayer'],
          gridSize: 7,
          puzzleMode: 'vault_break',
          difficulty: 'Easy',
          tags: ['beginner', 'vault'],
        },
        {
          id: '2',
          name: 'Secret Message',
          supportedModes: ['Solo'],
          gridSize: 7,
          puzzleMode: 'hidden_phrase',
          difficulty: 'Medium',
          tags: ['puzzle', 'phrase'],
        },
        {
          id: '3',
          name: 'Territory Wars',
          supportedModes: ['Multiplayer'],
          gridSize: 9,
          puzzleMode: 'territory_control',
          difficulty: 'Hard',
          tags: ['strategy', 'territory'],
        },
        {
          id: '4',
          name: 'Classic Challenge',
          supportedModes: ['Solo', 'Multiplayer'],
          gridSize: 7,
          puzzleMode: 'score_target',
          difficulty: 'Easy',
          tags: ['classic', 'score'],
        },
      ];

      let filteredBoards = mockBoards.filter(board => 
        board.supportedModes.includes(mode) || board.supportedModes.includes('Both' as PlayMode)
      );

      if (selectedDifficulty !== 'All') {
        filteredBoards = filteredBoards.filter(board => board.difficulty === selectedDifficulty);
      }

      setBoards(filteredBoards);
    } catch (error: any) {
      console.error('[BoardSelect] Failed to load boards:', error);
      setErrorModal({
        visible: true,
        message: error.message || 'Failed to load boards',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBoardSelect = (board: BoardListItem) => {
    console.log('[BoardSelect] Board selected:', board.name);
    router.push({
      pathname: '/game',
      params: {
        mode: mode.toLowerCase(),
        boardId: board.id,
      },
    });
  };

  const handleRandomBoard = () => {
    if (boards.length === 0) return;
    const randomIndex = Math.floor(Math.random() * boards.length);
    const randomBoard = boards[randomIndex];
    handleBoardSelect(randomBoard);
  };

  const getDifficultyColor = (difficulty: Difficulty): string => {
    switch (difficulty) {
      case 'Easy':
        return '#10B981';
      case 'Medium':
        return '#F59E0B';
      case 'Hard':
        return '#EF4444';
      case 'Special':
        return '#8B5CF6';
      default:
        return colors.primary;
    }
  };

  const getPuzzleModeLabel = (puzzleMode: PuzzleMode): string => {
    switch (puzzleMode) {
      case 'vault_break':
        return '🔓 Vault Break';
      case 'hidden_phrase':
        return '🔍 Hidden Phrase';
      case 'territory_control':
        return '🗺️ Territory Control';
      case 'score_target':
        return '🎯 Score Target';
      default:
        return '📊 Challenge';
    }
  };

  const getPuzzleModeDescription = (puzzleMode: PuzzleMode): string => {
    switch (puzzleMode) {
      case 'vault_break':
        return 'Unlock all vault tiles to win';
      case 'hidden_phrase':
        return 'Reveal the hidden phrase';
      case 'territory_control':
        return 'Control the most territory';
      case 'score_target':
        return 'Reach the target score';
      default:
        return 'Complete the challenge';
    }
  };

  const modeText = mode === 'Solo' ? 'Solo Boards' : 'Multiplayer Boards';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: modeText,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
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

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {(['All', 'Easy', 'Medium', 'Hard', 'Special'] as const).map((difficulty) => {
            const isSelected = selectedDifficulty === difficulty;
            const difficultyText = difficulty;
            return (
              <TouchableOpacity
                key={difficulty}
                style={[styles.filterButton, isSelected && styles.filterButtonActive]}
                onPress={() => setSelectedDifficulty(difficulty)}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                  {difficultyText}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading boards...</Text>
        </View>
      ) : boards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol
            ios_icon_name="tray"
            android_material_icon_name="inbox"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText}>No boards available</Text>
          <Text style={styles.emptySubtext}>Try selecting a different difficulty</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.randomButton} onPress={handleRandomBoard}>
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.randomGradient}
            >
              <IconSymbol
                ios_icon_name="shuffle"
                android_material_icon_name="shuffle"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.randomText}>Random Board</Text>
            </LinearGradient>
          </TouchableOpacity>

          {boards.map((board) => {
            const difficultyColor = getDifficultyColor(board.difficulty);
            const puzzleModeLabel = getPuzzleModeLabel(board.puzzleMode);
            const puzzleModeDescription = getPuzzleModeDescription(board.puzzleMode);
            const gridSizeText = `${board.gridSize}×${board.gridSize}`;
            const difficultyText = board.difficulty;

            return (
              <TouchableOpacity
                key={board.id}
                style={styles.boardCard}
                onPress={() => handleBoardSelect(board)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Text style={styles.boardName}>{board.name}</Text>
                    <Text style={styles.puzzleMode}>{puzzleModeLabel}</Text>
                  </View>
                  <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
                    <Text style={styles.difficultyText}>{difficultyText}</Text>
                  </View>
                </View>

                <Text style={styles.boardDescription}>{puzzleModeDescription}</Text>

                <View style={styles.cardFooter}>
                  <View style={styles.infoItem}>
                    <IconSymbol
                      ios_icon_name="grid"
                      android_material_icon_name="grid-on"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.infoText}>{gridSizeText}</Text>
                  </View>

                  {board.tags && board.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {board.tags.slice(0, 2).map((tag, index) => {
                        const tagText = tag;
                        return (
                          <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tagText}</Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>

                <View style={styles.playButton}>
                  <IconSymbol
                    ios_icon_name="play.fill"
                    android_material_icon_name="play-arrow"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.playButtonText}>Play</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <Modal
        visible={errorModal.visible}
        title="Error"
        message={errorModal.message}
        onClose={() => setErrorModal({ visible: false, message: '' })}
        type="error"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButton: {
    padding: 8,
  },
  filterContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.tile,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  randomButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  randomGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  randomText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  boardCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flex: 1,
    gap: 4,
  },
  boardName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  puzzleMode: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  boardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAlt,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});
