
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
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { BoardListItem, PlayMode, Difficulty } from '@/types/game';
import { Modal } from '@/components/button';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export default function BoardSelectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mode = (params.mode as string) || 'solo';
  
  const [boards, setBoards] = useState<BoardListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>('All');
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });

  useEffect(() => {
    console.log('[BoardSelect] Screen mounted with mode:', mode);
    loadBoards();
  }, [selectedDifficulty]);

  const loadBoards = async () => {
    console.log('[BoardSelect] Loading boards for mode:', mode, 'difficulty:', selectedDifficulty);
    setLoading(true);
    
    try {
      const { fetchBoards } = await import('@/utils/boardApi');
      
      // Map mode to API format
      const apiMode: PlayMode = mode === 'solo' ? 'Solo' : 'Multiplayer';
      
      // Build query params
      const params: any = {
        mode: apiMode,
        limit: 50,
        offset: 0,
      };
      
      // Add difficulty filter if not 'All'
      if (selectedDifficulty !== 'All') {
        params.difficulty = selectedDifficulty;
      }
      
      const response = await fetchBoards(params);
      console.log('[BoardSelect] Loaded boards from API:', response.boards.length);
      setBoards(response.boards);
    } catch (error: any) {
      console.error('[BoardSelect] Failed to load boards:', error);
      setErrorModal({
        visible: true,
        message: error.message || 'Failed to load boards. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBoardSelect = (board: BoardListItem) => {
    console.log('[BoardSelect] User selected board:', board.name);
    
    // Navigate to game with selected board
    router.push(`/game?mode=${mode}&boardId=${board.id}`);
  };

  const handleRandomBoard = () => {
    console.log('[BoardSelect] User tapped Random Board');
    
    if (boards.length === 0) {
      setErrorModal({
        visible: true,
        message: 'No boards available. Please try again.',
      });
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * boards.length);
    const randomBoard = boards[randomIndex];
    handleBoardSelect(randomBoard);
  };

  const getDifficultyColor = (difficulty: Difficulty): string => {
    switch (difficulty) {
      case 'Easy':
        return colors.success;
      case 'Medium':
        return colors.highlight;
      case 'Hard':
        return colors.accent;
      case 'Special':
        return colors.secondary;
      default:
        return colors.textSecondary;
    }
  };

  const getPuzzleModeLabel = (puzzleMode: string): string => {
    switch (puzzleMode) {
      case 'score_target':
        return 'Score Target';
      case 'clear_objectives':
        return 'Clear Objectives';
      case 'word_count':
        return 'Word Count';
      case 'time_attack':
        return 'Time Attack';
      default:
        return puzzleMode;
    }
  };

  const modeLabel = mode === 'solo' ? 'Solo' : 'Multiplayer';
  const difficulties: Array<Difficulty | 'All'> = ['All', 'Easy', 'Medium', 'Hard', 'Special'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: `${modeLabel} - Select Board`,
          headerBackTitle: 'Back',
        }}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Board</Text>
        <Text style={styles.subtitle}>Each board offers a unique challenge</Text>
      </View>

      {/* Difficulty Filter */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {difficulties.map((difficulty) => {
            const isSelected = selectedDifficulty === difficulty;
            const difficultyColor = difficulty === 'All' ? colors.primary : getDifficultyColor(difficulty as Difficulty);
            
            return (
              <TouchableOpacity
                key={difficulty}
                style={[
                  styles.filterButton,
                  isSelected && { backgroundColor: difficultyColor },
                ]}
                onPress={() => setSelectedDifficulty(difficulty)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    isSelected && styles.filterButtonTextActive,
                  ]}
                >
                  {difficulty}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Random Board Button */}
      <View style={styles.randomButtonContainer}>
        <TouchableOpacity
          style={styles.randomButton}
          onPress={handleRandomBoard}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.secondary, '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.randomButtonGradient}
          >
            <IconSymbol
              ios_icon_name="shuffle"
              android_material_icon_name="shuffle"
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.randomButtonText}>Random Board</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Board List */}
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
        <ScrollView
          style={styles.boardList}
          contentContainerStyle={styles.boardListContent}
          showsVerticalScrollIndicator={false}
        >
          {boards.map((board) => {
            const difficultyColor = getDifficultyColor(board.difficulty);
            const puzzleModeLabel = getPuzzleModeLabel(board.puzzleMode);
            const gridSizeText = `${board.gridSize}x${board.gridSize}`;
            
            return (
              <TouchableOpacity
                key={board.id}
                style={styles.boardCard}
                onPress={() => handleBoardSelect(board)}
                activeOpacity={0.85}
              >
                <View style={styles.boardCardHeader}>
                  <View style={styles.boardCardTitleRow}>
                    <Text style={styles.boardCardTitle}>{board.name}</Text>
                    <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
                      <Text style={styles.difficultyBadgeText}>{board.difficulty}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.boardCardDetails}>
                  <View style={styles.boardCardDetail}>
                    <IconSymbol
                      ios_icon_name="grid"
                      android_material_icon_name="grid-on"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.boardCardDetailText}>{gridSizeText} Grid</Text>
                  </View>

                  <View style={styles.boardCardDetail}>
                    <IconSymbol
                      ios_icon_name="target"
                      android_material_icon_name="track-changes"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.boardCardDetailText}>{puzzleModeLabel}</Text>
                  </View>
                </View>

                {board.tags && board.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {board.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.boardCardFooter}>
                  <IconSymbol
                    ios_icon_name="chevron.right"
                    android_material_icon_name="chevron-right"
                    size={20}
                    color={colors.primary}
                  />
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  filterContainer: {
    paddingVertical: 12,
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
    borderWidth: 1,
    borderColor: colors.backgroundAlt,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  randomButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  randomButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  randomButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  randomButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
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
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  boardList: {
    flex: 1,
  },
  boardListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  boardCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  boardCardHeader: {
    gap: 8,
  },
  boardCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  boardCardTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  boardCardDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  boardCardDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  boardCardDetailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  boardCardFooter: {
    alignItems: 'flex-end',
  },
});
