
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
import { authenticatedGet } from '@/utils/api';

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
  const [showDifficultyInfo, setShowDifficultyInfo] = useState(false);

  useEffect(() => {
    loadBoards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDifficulty]); // loadBoards is stable, no need to include

  const loadBoards = async () => {
    console.log('[BoardSelect] Loading boards for mode:', mode, 'difficulty:', selectedDifficulty);
    setLoading(true);
    
    try {
      // Build query params
      const params = new URLSearchParams();
      params.append('mode', mode);
      if (selectedDifficulty !== 'All') {
        params.append('difficulty', selectedDifficulty);
      }
      params.append('isActive', 'true');
      
      console.log('[BoardSelect] Fetching boards with params:', params.toString());
      
      // Fetch boards from backend
      const response = await authenticatedGet<BoardListItem[]>(`/api/boards?${params.toString()}`);
      console.log('[BoardSelect] Boards loaded:', response.length, 'boards');
      
      setBoards(response);
    } catch (error: any) {
      console.error('[BoardSelect] Failed to load boards:', error);
      
      // Fallback to mock data if backend fails
      console.log('[BoardSelect] Using fallback mock data');
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
    } finally {
      setLoading(false);
    }
  };

  const handleBoardSelect = (board: BoardListItem) => {
    console.log('[BoardSelect] Board selected:', board.name, 'mode:', mode);
    
    // Set turn limit based on difficulty for solo mode
    let turnLimit = 20; // Default
    if (mode === 'Solo') {
      switch (board.difficulty) {
        case 'Easy':
          turnLimit = 25;
          break;
        case 'Medium':
          turnLimit = 20;
          break;
        case 'Hard':
          turnLimit = 15;
          break;
        case 'Special':
          turnLimit = 30;
          break;
      }
    }
    
    // Set target score based on puzzle mode and difficulty
    let targetScore = 500;
    if (board.puzzleMode === 'score_target') {
      switch (board.difficulty) {
        case 'Easy':
          targetScore = 300;
          break;
        case 'Medium':
          targetScore = 500;
          break;
        case 'Hard':
          targetScore = 800;
          break;
        case 'Special':
          targetScore = 1000;
          break;
      }
    }
    
    router.push({
      pathname: '/game',
      params: {
        mode: mode.toLowerCase(),
        boardId: board.id,
        boardName: board.name,
        difficulty: board.difficulty,
        puzzleMode: board.puzzleMode,
        gridSize: board.gridSize.toString(),
        targetScore: targetScore.toString(),
        turnLimit: turnLimit.toString(),
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
        return '#10B981'; // Green
      case 'Medium':
        return '#F59E0B'; // Amber
      case 'Hard':
        return '#EF4444'; // Red
      case 'Special':
        return '#8B5CF6'; // Purple
      default:
        return colors.primary;
    }
  };

  const getDifficultyIcon = (difficulty: Difficulty): string => {
    switch (difficulty) {
      case 'Easy':
        return '🌱'; // Seedling
      case 'Medium':
        return '⚡'; // Lightning
      case 'Hard':
        return '🔥'; // Fire
      case 'Special':
        return '⭐'; // Star
      default:
        return '📊';
    }
  };

  const getDifficultyDescription = (difficulty: Difficulty): string => {
    switch (difficulty) {
      case 'Easy':
        return '🌱 Fewer locked tiles • Minimal board movement • Clear progress feedback';
      case 'Medium':
        return '⚡ Board rotation/shifting • Multiple puzzle elements • Requires planning';
      case 'Hard':
        return '🔥 Multiple mechanics • Aggressive changes • Punishes inefficiency';
      case 'Special':
        return '⭐ Experimental rules • Event-specific • Designed to surprise';
      default:
        return '';
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
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowDifficultyInfo(true)} style={styles.headerButton}>
              <IconSymbol
                ios_icon_name="info.circle"
                android_material_icon_name="info"
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
            const difficultyIcon = difficulty !== 'All' ? getDifficultyIcon(difficulty as Difficulty) : '🎮';
            
            // Count boards for this difficulty
            let boardCount = 0;
            if (difficulty === 'All') {
              boardCount = boards.length;
            } else {
              boardCount = boards.filter(b => b.difficulty === difficulty).length;
            }
            const boardCountText = String(boardCount);
            
            return (
              <TouchableOpacity
                key={difficulty}
                style={[styles.filterButton, isSelected && styles.filterButtonActive]}
                onPress={() => setSelectedDifficulty(difficulty)}
              >
                <Text style={styles.filterIcon}>{difficultyIcon}</Text>
                <View style={styles.filterTextContainer}>
                  <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                    {difficultyText}
                  </Text>
                  {!loading && (
                    <Text style={[styles.filterCount, isSelected && styles.filterCountActive]}>
                      {boardCountText}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {selectedDifficulty !== 'All' && (
        <View style={[styles.difficultyInfoBanner, { borderLeftColor: getDifficultyColor(selectedDifficulty as Difficulty) }]}>
          <Text style={styles.difficultyInfoText}>
            {getDifficultyDescription(selectedDifficulty as Difficulty)}
          </Text>
        </View>
      )}

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
          {/* Board Count Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>
              {boards.length} {boards.length === 1 ? 'Board' : 'Boards'} Available
            </Text>
            <Text style={styles.summarySubtitle}>
              {selectedDifficulty === 'All' 
                ? 'Showing all difficulty levels' 
                : `Filtered by ${selectedDifficulty} difficulty`}
            </Text>
          </View>

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
            const difficultyIcon = getDifficultyIcon(board.difficulty);
            const puzzleModeLabel = getPuzzleModeLabel(board.puzzleMode);
            const puzzleModeDescription = getPuzzleModeDescription(board.puzzleMode);
            const gridSizeText = `${board.gridSize}×${board.gridSize}`;
            const difficultyText = board.difficulty;

            return (
              <TouchableOpacity
                key={board.id}
                style={[styles.boardCard, { borderLeftWidth: 4, borderLeftColor: difficultyColor }]}
                onPress={() => handleBoardSelect(board)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Text style={styles.boardName}>{board.name}</Text>
                    <Text style={styles.puzzleMode}>{puzzleModeLabel}</Text>
                  </View>
                  <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
                    <Text style={styles.difficultyIcon}>{difficultyIcon}</Text>
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

      <Modal
        visible={showDifficultyInfo}
        title="Difficulty Tiers"
        onClose={() => setShowDifficultyInfo(false)}
        type="info"
      >
        <View style={styles.difficultyInfoModal}>
          <View style={styles.difficultyInfoItem}>
            <View style={[styles.difficultyInfoBadge, { backgroundColor: '#10B981' }]}>
              <Text style={styles.difficultyInfoIcon}>🌱</Text>
              <Text style={styles.difficultyInfoTitle}>Easy</Text>
            </View>
            <Text style={styles.difficultyInfoDescription}>
              • Fewer locked tiles{'\n'}
              • Minimal board movement{'\n'}
              • Clear progress feedback{'\n'}
              • Perfect for onboarding and casual play
            </Text>
          </View>

          <View style={styles.difficultyInfoItem}>
            <View style={[styles.difficultyInfoBadge, { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.difficultyInfoIcon}>⚡</Text>
              <Text style={styles.difficultyInfoTitle}>Medium</Text>
            </View>
            <Text style={styles.difficultyInfoDescription}>
              • Board rotation or shifting{'\n'}
              • Multiple puzzle elements active{'\n'}
              • Requires planning and timing{'\n'}
              • Balanced challenge for regular players
            </Text>
          </View>

          <View style={styles.difficultyInfoItem}>
            <View style={[styles.difficultyInfoBadge, { backgroundColor: '#EF4444' }]}>
              <Text style={styles.difficultyInfoIcon}>🔥</Text>
              <Text style={styles.difficultyInfoTitle}>Hard</Text>
            </View>
            <Text style={styles.difficultyInfoDescription}>
              • Multiple simultaneous mechanics{'\n'}
              • Aggressive board changes{'\n'}
              • Punishes inefficient choices{'\n'}
              • Designed for mastery and replay
            </Text>
          </View>

          <View style={styles.difficultyInfoItem}>
            <View style={[styles.difficultyInfoBadge, { backgroundColor: '#8B5CF6' }]}>
              <Text style={styles.difficultyInfoIcon}>⭐</Text>
              <Text style={styles.difficultyInfoTitle}>Special</Text>
            </View>
            <Text style={styles.difficultyInfoDescription}>
              • Experimental rule sets{'\n'}
              • Event-specific mechanics{'\n'}
              • Unique challenges{'\n'}
              • Designed to surprise experienced players
            </Text>
          </View>

          <View style={styles.difficultyInfoNote}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={20}
              color={colors.success}
            />
            <Text style={styles.difficultyInfoNoteText}>
              All difficulties are always available - never hard-blocked! Play at your own pace and skill level.
            </Text>
          </View>
          
          <View style={styles.difficultyScalingSection}>
            <Text style={styles.difficultyScalingTitle}>Difficulty Scaling</Text>
            <Text style={styles.difficultyScalingText}>
              • Easy boards gradually introduce mechanics{'\n'}
              • Medium boards combine multiple elements{'\n'}
              • Hard boards demand strategic mastery{'\n'}
              • Special boards offer unique experiences{'\n'}
              {'\n'}
              Casual players can always enjoy Easy and Medium boards, while competitive players can challenge themselves with Hard and Special content.
            </Text>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterIcon: {
    fontSize: 16,
  },
  filterTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.text,
  },
  filterCount: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  filterCountActive: {
    color: colors.text,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  difficultyInfoBanner: {
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.tile,
    borderLeftWidth: 4,
  },
  difficultyInfoText: {
    fontSize: 13,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
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
  summaryContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  difficultyIcon: {
    fontSize: 14,
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
  difficultyInfoModal: {
    gap: 20,
  },
  difficultyInfoItem: {
    gap: 8,
  },
  difficultyInfoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
    alignSelf: 'flex-start',
  },
  difficultyInfoIcon: {
    fontSize: 20,
  },
  difficultyInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  difficultyInfoDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  difficultyInfoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.backgroundAlt,
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  difficultyInfoNoteText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 18,
  },
  difficultyScalingSection: {
    backgroundColor: colors.backgroundAlt,
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  difficultyScalingTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  difficultyScalingText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
