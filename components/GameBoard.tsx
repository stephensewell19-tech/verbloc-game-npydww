
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Tile, Position } from '@/types/game';
import { colors } from '@/styles/commonStyles';
import Animated, { useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';

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
  const animatedStyle = useAnimatedStyle(() => {
    const scale = selected ? withSpring(1.1) : withSpring(1);
    return {
      transform: [{ scale }],
    };
  });

  const getTileColor = () => {
    if (selected) return colors.tileActive;
    if (tile.isSpecial) {
      if (tile.specialType === 'double') return '#F59E0B';
      if (tile.specialType === 'triple') return '#EF4444';
      if (tile.specialType === 'wildcard') return '#8B5CF6';
    }
    return colors.tile;
  };

  const tileColor = getTileColor();

  return (
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        style={[
          styles.tile,
          {
            width: size,
            height: size,
            backgroundColor: tileColor,
          },
        ]}
      >
        <Text style={styles.letter}>{tile.letter}</Text>
        <Text style={styles.value}>{tile.value}</Text>
        {selected && order > 0 && (
          <View style={styles.orderBadge}>
            <Text style={styles.orderText}>{order}</Text>
          </View>
        )}
        {tile.isSpecial && !selected && (
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
