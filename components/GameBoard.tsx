
import { colors } from '@/styles/commonStyles';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withTiming,
  useSharedValue,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Tile, Position } from '@/types/game';

interface GameBoardProps {
  tiles: Tile[][];
  selectedPositions: Position[];
  onTilePress: (row: number, col: number) => void;
  disabled?: boolean;
}

interface TileComponentProps {
  tile: Tile;
  size: number;
  selected: boolean;
  order: number;
  onPress: () => void;
  disabled?: boolean;
}

const BOARD_PADDING = 16;
const TILE_GAP = 4;

function resolveImageSource(source: string | number | any): any {
  if (!source) {
    return { uri: '' };
  }
  if (typeof source === 'string') {
    return { uri: source };
  }
  return source;
}

function TileComponent({ tile, size, selected, order, onPress, disabled }: TileComponentProps) {
  // Initialize hooks unconditionally at the top
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glow = useSharedValue(0);

  // Safety check: Ensure tile exists
  if (!tile) {
    console.error('[TileComponent] Tile is null or undefined');
    return (
      <View style={[styles.tile, { width: size, height: size, backgroundColor: '#333' }]}>
        <Text style={styles.errorText}>?</Text>
      </View>
    );
  }
  
  // Safety check: Ensure size is valid
  if (!size || size <= 0 || !isFinite(size)) {
    console.error('[TileComponent] Invalid size:', size);
    return null;
  }

  useEffect(() => {
    try {
      if (selected) {
        glow.value = withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.7, { duration: 500 })
        );
      } else {
        glow.value = withTiming(0, { duration: 200 });
      }
    } catch (animError) {
      console.error('[TileComponent] Animation error:', animError);
      // Don't crash - animations are optional
    }
  }, [selected, glow]);

  const animatedStyle = useAnimatedStyle(() => {
    const glowOpacity = interpolate(
      glow.value,
      [0, 1],
      [0, 0.8],
      Extrapolate.CLAMP
    );

    const glowRadius = interpolate(
      glow.value,
      [0, 1],
      [0, 12],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
      boxShadow: `0px 4px ${glowRadius}px rgba(0, 0, 0, ${glowOpacity})`,
    };
  });

  function handlePress() {
    console.log('[TileComponent] Tile pressed, disabled:', disabled, 'locked:', tile.isLocked);
    
    try {
      if (disabled || tile.isLocked) {
        // Shake animation for locked tiles
        rotation.value = withSequence(
          withSpring(-5, { damping: 10 }),
          withSpring(5, { damping: 10 }),
          withSpring(0, { damping: 10 })
        );
        return;
      }

      // Pop animation on press
      scale.value = withSequence(
        withSpring(0.85, { damping: 10 }),
        withSpring(1.05, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );
    } catch (animError) {
      console.error('[TileComponent] Animation error:', animError);
      // Don't crash - animations are optional
    }

    // Safety check: Ensure onPress exists
    if (typeof onPress === 'function') {
      try {
        onPress();
      } catch (pressError) {
        console.error('[TileComponent] onPress error:', pressError);
      }
    } else {
      console.error('[TileComponent] onPress is not a function:', onPress);
    }
  }

  function getTileColor(): string {
    if (tile.isLocked) {
      return '#6B7280';
    }

    if (tile.ownerColor) {
      return tile.ownerColor;
    }

    if (selected) {
      return colors.primary;
    }

    if (tile.isSpecial) {
      if (tile.specialType === 'double') {
        return '#3B82F6';
      } else if (tile.specialType === 'triple') {
        return '#8B5CF6';
      } else if (tile.specialType === 'wildcard') {
        return '#F59E0B';
      }
    }

    if (tile.isVault) {
      return tile.isLocked ? '#DC2626' : '#10B981';
    }

    if (tile.isPhraseLetter) {
      return tile.isRevealed ? '#10B981' : '#6366F1';
    }

    if (tile.isClaimable && !tile.ownerId) {
      return '#D1D5DB';
    }

    return colors.card;
  }

  function getTileBadge(): string | null {
    if (tile.isSpecial) {
      if (tile.specialType === 'double') {
        return '2×';
      } else if (tile.specialType === 'triple') {
        return '3×';
      } else if (tile.specialType === 'wildcard') {
        return '★';
      }
    }

    if (tile.isVault && tile.isLocked) {
      return '🔒';
    }

    if (tile.isPhraseLetter && !tile.isRevealed) {
      return '?';
    }

    return null;
  }

  const tileColor = getTileColor();
  const badge = getTileBadge();
  const displayLetter = tile.letter || '';
  const isInteractive = !disabled && !tile.isLocked;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!isInteractive}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.tile,
          {
            width: size,
            height: size,
            backgroundColor: tileColor,
          },
          animatedStyle,
          !isInteractive && styles.tileDisabled,
        ]}
      >
        {selected && order > 0 && (
          <Animated.View 
            entering={withSpring}
            style={styles.orderBadge}
          >
            <Text style={styles.orderText}>{order}</Text>
          </Animated.View>
        )}

        <Text
          style={[
            styles.letter,
            { fontSize: size * 0.4 },
            selected && styles.letterSelected,
            tile.isLocked && styles.letterLocked,
          ]}
        >
          {displayLetter}
        </Text>

        {badge && (
          <View style={styles.specialBadge}>
            <Text style={styles.specialBadgeText}>{badge}</Text>
          </View>
        )}

        {!tile.isLocked && tile.value > 0 && (
          <Text style={styles.value}>{tile.value}</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function GameBoard({ tiles, selectedPositions, onTilePress, disabled }: GameBoardProps) {
  console.log('[GameBoard] Rendering board with', tiles?.length || 0, 'rows');
  
  // Safety check: Ensure tiles exist and are valid
  if (!tiles || !Array.isArray(tiles) || tiles.length === 0) {
    console.error('[GameBoard] Invalid tiles data:', tiles);
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Board not available</Text>
          <Text style={styles.errorSubtext}>Please restart the game</Text>
        </View>
      </View>
    );
  }
  
  // Safety check: Ensure all rows are valid arrays
  const invalidRows = tiles.filter(row => !row || !Array.isArray(row) || row.length === 0);
  if (invalidRows.length > 0) {
    console.error('[GameBoard] Invalid rows detected:', invalidRows.length);
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Board corrupted</Text>
          <Text style={styles.errorSubtext}>Please restart the game</Text>
        </View>
      </View>
    );
  }
  
  const screenWidth = Dimensions.get('window').width;
  const boardSize = tiles.length;
  const availableWidth = screenWidth - (BOARD_PADDING * 2);
  const tileSize = (availableWidth - (TILE_GAP * (boardSize - 1))) / boardSize;
  
  // Safety check: Ensure tileSize is valid
  if (!tileSize || tileSize <= 0 || !isFinite(tileSize)) {
    console.error('[GameBoard] Invalid tile size calculated:', tileSize);
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Display error</Text>
          <Text style={styles.errorSubtext}>Please restart the app</Text>
        </View>
      </View>
    );
  }

  function isTileSelected(row: number, col: number): boolean {
    if (!selectedPositions || !Array.isArray(selectedPositions)) {
      return false;
    }
    return selectedPositions.some(pos => pos && pos.row === row && pos.col === col);
  }

  function getSelectionOrder(row: number, col: number): number {
    if (!selectedPositions || !Array.isArray(selectedPositions)) {
      return 0;
    }
    const index = selectedPositions.findIndex(pos => pos && pos.row === row && pos.col === col);
    return index !== -1 ? index + 1 : 0;
  }

  return (
    <View style={styles.container}>
      {tiles.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((tile, colIndex) => {
            // Safety check: Ensure tile exists
            if (!tile) {
              console.error('[GameBoard] Missing tile at', rowIndex, colIndex);
              return (
                <View 
                  key={`${rowIndex}-${colIndex}`} 
                  style={[styles.tile, { width: tileSize, height: tileSize, backgroundColor: '#333' }]}
                >
                  <Text style={styles.errorText}>?</Text>
                </View>
              );
            }
            
            return (
              <TileComponent
                key={`${rowIndex}-${colIndex}`}
                tile={tile}
                size={tileSize}
                selected={isTileSelected(rowIndex, colIndex)}
                order={getSelectionOrder(rowIndex, colIndex)}
                onPress={() => onTilePress(rowIndex, colIndex)}
                disabled={disabled}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    padding: BOARD_PADDING,
  },
  row: {
    flexDirection: 'row',
    gap: TILE_GAP,
    marginBottom: TILE_GAP,
  },
  tile: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    minHeight: 200,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tileDisabled: {
    opacity: 0.6,
  },
  letter: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  letterSelected: {
    color: '#FFFFFF',
  },
  letterLocked: {
    color: '#9CA3AF',
  },
  value: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  orderBadge: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  specialBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  specialBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
