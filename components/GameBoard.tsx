
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Tile, Position } from '@/types/game';
import { colors } from '@/styles/commonStyles';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const BOARD_PADDING = 20;
const TILE_GAP = 6;

interface GameBoardProps {
  tiles: Tile[][];
  selectedPositions: Position[];
  onTilePress: (row: number, col: number) => void;
  disabled?: boolean;
}

function resolveImageSource(source: string | number | any): any {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source;
}

export default function GameBoard({ tiles, selectedPositions, onTilePress, disabled }: GameBoardProps) {
  const boardSize = tiles.length;
  const tileSize = (width - BOARD_PADDING * 2 - TILE_GAP * (boardSize - 1)) / boardSize;

  const isTileSelected = (row: number, col: number): boolean => {
    return selectedPositions.some(pos => pos.row === row && pos.col === col);
  };

  const getSelectionOrder = (row: number, col: number): number => {
    const index = selectedPositions.findIndex(pos => pos.row === row && pos.col === col);
    return index >= 0 ? index + 1 : 0;
  };

  return (
    <View style={styles.container}>
      {tiles.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((tile, colIndex) => {
            const selected = isTileSelected(rowIndex, colIndex);
            const order = getSelectionOrder(rowIndex, colIndex);
            
            return (
              <TileComponent
                key={`${rowIndex}-${colIndex}`}
                tile={tile}
                size={tileSize}
                selected={selected}
                order={order}
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

interface TileComponentProps {
  tile: Tile;
  size: number;
  selected: boolean;
  order: number;
  onPress: () => void;
  disabled?: boolean;
}

function TileComponent({ tile, size, selected, order, onPress, disabled }: TileComponentProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const targetScale = selected ? 1.1 : 1;
    return {
      transform: [
        { scale: withSpring(targetScale, { damping: 15, stiffness: 200 }) },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  const handlePress = () => {
    if (disabled) return;
    
    // Don't allow interaction with locked tiles
    if (tile.isLocked) return;
    
    // Trigger press animation
    scale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 200 })
    );
    
    // Trigger rotation animation for selection
    if (!selected) {
      rotation.value = withSequence(
        withTiming(-5, { duration: 100 }),
        withTiming(5, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    }
    
    onPress();
  };

  const getTileColor = () => {
    if (selected) return colors.tileActive;
    
    // Territory Control - show owner color
    if (tile.ownerId && tile.ownerColor) {
      return tile.ownerColor;
    }
    
    // Vault Break - locked tiles
    if (tile.isLocked && tile.isVault) {
      return '#374151'; // Dark gray for locked vaults
    }
    
    // Hidden Phrase - unrevealed phrase letters
    if (tile.isPhraseLetter && !tile.isRevealed) {
      return '#8B5CF6'; // Purple for hidden letters
    }
    
    // Hidden Phrase - revealed phrase letters
    if (tile.isPhraseLetter && tile.isRevealed) {
      return '#10B981'; // Green for revealed letters
    }
    
    // Territory Control - claimable tiles
    if (tile.isClaimable && !tile.ownerId) {
      return '#F59E0B'; // Orange for unclaimed territory
    }
    
    // Handle board system tile types
    if (tile.type === 'locked') return '#374151';
    if (tile.type === 'objective') return '#8B5CF6';
    if (tile.type === 'puzzle') return '#F59E0B';
    
    // Handle special tiles (legacy system)
    if (tile.isSpecial) {
      if (tile.specialType === 'double') return '#F59E0B';
      if (tile.specialType === 'triple') return '#EF4444';
      if (tile.specialType === 'wildcard') return '#8B5CF6';
    }
    
    return colors.tile;
  };

  const getTileBadge = () => {
    if (tile.isLocked && tile.isVault) return '🔒';
    if (tile.isPhraseLetter && !tile.isRevealed) return '?';
    if (tile.isPhraseLetter && tile.isRevealed) return '✓';
    if (tile.ownerId) return '👤';
    return null;
  };

  const tileColor = getTileColor();
  const tileBadge = getTileBadge();

  return (
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || tile.isLocked}
        activeOpacity={0.7}
        style={[
          styles.tile,
          {
            width: size,
            height: size,
            backgroundColor: tileColor,
          },
          tile.isLocked && styles.tileDisabled,
        ]}
      >
        <Text style={styles.letter}>{tile.letter}</Text>
        <Text style={styles.value}>{tile.value}</Text>
        
        {selected && order > 0 && (
          <View style={styles.orderBadge}>
            <Text style={styles.orderText}>{order}</Text>
          </View>
        )}
        
        {!selected && tileBadge && (
          <View style={styles.specialBadge}>
            <Text style={styles.specialText}>{tileBadge}</Text>
          </View>
        )}
        
        {!selected && tile.isSpecial && !tileBadge && (
          <View style={styles.specialBadge}>
            <Text style={styles.specialText}>
              {tile.specialType === 'double' ? '2×' : tile.specialType === 'triple' ? '3×' : '★'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: BOARD_PADDING,
  },
  row: {
    flexDirection: 'row',
    marginBottom: TILE_GAP,
  },
  tile: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: TILE_GAP,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  tileDisabled: {
    opacity: 0.6,
  },
  letter: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  value: {
    fontSize: 10,
    color: colors.textSecondary,
    position: 'absolute',
    bottom: 4,
    right: 6,
  },
  orderBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.accent,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  specialBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  specialText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
