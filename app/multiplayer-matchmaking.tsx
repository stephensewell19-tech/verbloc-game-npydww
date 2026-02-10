
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Share,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { Modal } from '@/components/button';
import { authenticatedPost, authenticatedGet } from '@/utils/api';
import { BoardListItem } from '@/types/game';
import { LinearGradient } from 'expo-linear-gradient';

type MatchmakingMode = 'random' | 'private' | 'invite';

export default function MultiplayerMatchmakingScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<MatchmakingMode | null>(null);
  const [isLiveMatch, setIsLiveMatch] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [boards, setBoards] = useState<BoardListItem[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [createdInviteCode, setCreatedInviteCode] = useState<string | null>(null);
  const [createdGameId, setCreatedGameId] = useState<string | null>(null);

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      const response = await authenticatedGet<any>('/api/boards?mode=Multiplayer&isActive=true');
      
      // Handle both array response and object with boards property
      const boardsData = Array.isArray(response) ? response : (response.boards || []);
      console.log('[Matchmaking] Boards loaded:', boardsData.length, 'boards');
      
      const multiplayerBoards = boardsData.filter(
        (b: BoardListItem) => b.supportedModes.includes('Multiplayer') || b.supportedModes.includes('Both')
      );
      setBoards(multiplayerBoards);
      if (multiplayerBoards.length > 0) {
        setSelectedBoardId(multiplayerBoards[0].id);
      } else {
        // Show error if no boards available
        setError('No multiplayer boards available. Please go to your Profile and tap "Seed Production Boards (70+)" to set up the game boards.');
      }
    } catch (err) {
      console.error('[Matchmaking] Failed to load boards:', err);
      setError('Failed to load boards. Please try again or seed the boards from your Profile.');
    }
  };

  const handleRandomMatchmaking = async () => {
    console.log('[Matchmaking] Random matchmaking requested');
    
    // Safety check: Validate board selection
    if (!selectedBoardId || typeof selectedBoardId !== 'string') {
      console.error('[Matchmaking] Invalid board selection:', selectedBoardId);
      setError('Please select a board');
      return;
    }
    
    // Prevent double-tap
    if (loading) {
      console.log('[Matchmaking] Already loading, ignoring duplicate request');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('[Matchmaking] Starting random matchmaking with params:', {
        boardId: selectedBoardId,
        isLiveMatch,
        maxPlayers,
      });
      
      const response = await authenticatedPost('/api/game/multiplayer/matchmaking/random', {
        boardId: selectedBoardId,
        isLiveMatch,
        maxPlayers,
      });
      
      // Safety check: Validate response
      if (!response || !response.gameId) {
        console.error('[Matchmaking] Invalid response:', response);
        throw new Error('Invalid response from server');
      }

      console.log('[Matchmaking] Random match created:', response);
      router.push(`/multiplayer-game?gameId=${response.gameId}`);
    } catch (err: any) {
      console.error('[Matchmaking] Random matchmaking failed:', err);
      setError(err.message || 'Failed to find match. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrivateLobby = async () => {
    if (!selectedBoardId) {
      setError('Please select a board');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('[Matchmaking] Creating private lobby');
      const response = await authenticatedPost('/api/game/multiplayer/matchmaking/create-private', {
        boardId: selectedBoardId,
        isLiveMatch,
        maxPlayers,
      });

      console.log('[Matchmaking] Private lobby created:', response);
      setCreatedInviteCode(response.inviteCode);
      setCreatedGameId(response.gameId);
      
      // Start polling to check if players have joined
      const checkInterval = setInterval(async () => {
        try {
          const gameStatus = await authenticatedGet(`/api/game/multiplayer/${response.gameId}`);
          if (gameStatus.players.length >= 2) {
            clearInterval(checkInterval);
            router.push(`/multiplayer-game?gameId=${response.gameId}`);
          }
        } catch (err) {
          console.error('[Matchmaking] Failed to check game status:', err);
        }
      }, 3000);
      
      // Clean up interval after 5 minutes
      setTimeout(() => clearInterval(checkInterval), 5 * 60 * 1000);
    } catch (err: any) {
      console.error('[Matchmaking] Failed to create private lobby:', err);
      setError(err.message || 'Failed to create lobby');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByCode = async () => {
    console.log('[Matchmaking] Join by code requested');
    
    // Safety check: Validate invite code
    if (!inviteCode || typeof inviteCode !== 'string' || inviteCode.trim() === '') {
      console.error('[Matchmaking] Invalid invite code:', inviteCode);
      setError('Please enter an invite code');
      return;
    }
    
    // Prevent double-tap
    if (loading) {
      console.log('[Matchmaking] Already loading, ignoring duplicate request');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const normalizedCode = inviteCode.trim().toUpperCase();
      console.log('[Matchmaking] Joining by code:', normalizedCode);
      
      const response = await authenticatedPost('/api/game/multiplayer/matchmaking/join-by-code', {
        inviteCode: normalizedCode,
      });
      
      // Safety check: Validate response
      if (!response || !response.gameId) {
        console.error('[Matchmaking] Invalid response:', response);
        throw new Error('Invalid response from server');
      }

      console.log('[Matchmaking] Joined game:', response);
      router.push(`/multiplayer-game?gameId=${response.gameId}`);
    } catch (err: any) {
      console.error('[Matchmaking] Failed to join by code:', err);
      setError(err.message || 'Failed to join game. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShareInviteCode = async () => {
    if (!createdInviteCode) return;

    try {
      await Share.share({
        message: `Join my VERBLOC game! Use invite code: ${createdInviteCode}`,
        title: 'VERBLOC Invite',
      });
    } catch (err) {
      console.error('[Matchmaking] Failed to share:', err);
    }
  };

  const renderModeSelection = () => (
    <View style={styles.modeContainer}>
      <Text style={styles.title}>Choose Matchmaking Mode</Text>

      <TouchableOpacity
        style={styles.modeButton}
        onPress={() => setMode('random')}
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.modeGradient}
        >
          <IconSymbol
            ios_icon_name="shuffle"
            android_material_icon_name="shuffle"
            size={32}
            color="#fff"
          />
          <Text style={styles.modeButtonText}>Random Matchmaking</Text>
          <Text style={styles.modeButtonSubtext}>Find an opponent quickly</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.modeButton}
        onPress={() => setMode('private')}
      >
        <LinearGradient
          colors={[colors.accent, colors.primary]}
          style={styles.modeGradient}
        >
          <IconSymbol
            ios_icon_name="lock.fill"
            android_material_icon_name="lock"
            size={32}
            color="#fff"
          />
          <Text style={styles.modeButtonText}>Create Private Lobby</Text>
          <Text style={styles.modeButtonSubtext}>Invite friends with a code</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.modeButton}
        onPress={() => setMode('invite')}
      >
        <LinearGradient
          colors={[colors.secondary, colors.accent]}
          style={styles.modeGradient}
        >
          <IconSymbol
            ios_icon_name="envelope.fill"
            android_material_icon_name="mail"
            size={32}
            color="#fff"
          />
          <Text style={styles.modeButtonText}>Join with Code</Text>
          <Text style={styles.modeButtonSubtext}>Enter a friend's invite code</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderRandomMatchmaking = () => (
    <ScrollView style={styles.configContainer}>
      <Text style={styles.sectionTitle}>Random Matchmaking</Text>

      <View style={styles.optionGroup}>
        <Text style={styles.optionLabel}>Match Type</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, !isLiveMatch && styles.toggleButtonActive]}
            onPress={() => setIsLiveMatch(false)}
          >
            <Text style={[styles.toggleText, !isLiveMatch && styles.toggleTextActive]}>
              Async
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, isLiveMatch && styles.toggleButtonActive]}
            onPress={() => setIsLiveMatch(true)}
          >
            <Text style={[styles.toggleText, isLiveMatch && styles.toggleTextActive]}>
              Live
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.optionGroup}>
        <Text style={styles.optionLabel}>Players</Text>
        <View style={styles.playerSelector}>
          {[2, 3, 4].map((num) => (
            <TouchableOpacity
              key={num}
              style={[styles.playerButton, maxPlayers === num && styles.playerButtonActive]}
              onPress={() => setMaxPlayers(num)}
            >
              <Text style={[styles.playerText, maxPlayers === num && styles.playerTextActive]}>
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.optionGroup}>
        <Text style={styles.optionLabel}>Select Board</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.boardScroll}>
          {boards.map((board) => (
            <TouchableOpacity
              key={board.id}
              style={[
                styles.boardCard,
                selectedBoardId === board.id && styles.boardCardActive,
              ]}
              onPress={() => setSelectedBoardId(board.id)}
            >
              <Text style={styles.boardName}>{board.name}</Text>
              <Text style={styles.boardDifficulty}>{board.difficulty}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={[styles.actionButton, loading && styles.actionButtonDisabled]}
        onPress={handleRandomMatchmaking}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <React.Fragment>
            <IconSymbol
              ios_icon_name="play.fill"
              android_material_icon_name="play-arrow"
              size={24}
              color="#fff"
            />
            <Text style={styles.actionButtonText}>Find Match</Text>
          </React.Fragment>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => setMode(null)}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderPrivateLobby = () => (
    <ScrollView style={styles.configContainer}>
      <Text style={styles.sectionTitle}>Create Private Lobby</Text>

      {createdInviteCode ? (
        <View style={styles.inviteCodeContainer}>
          <Text style={styles.inviteCodeLabel}>Your Invite Code:</Text>
          <View style={styles.inviteCodeBox}>
            <Text style={styles.inviteCodeText}>{createdInviteCode}</Text>
          </View>
          <TouchableOpacity style={styles.shareButton} onPress={handleShareInviteCode}>
            <IconSymbol
              ios_icon_name="square.and.arrow.up"
              android_material_icon_name="share"
              size={20}
              color="#fff"
            />
            <Text style={styles.shareButtonText}>Share Code</Text>
          </TouchableOpacity>
          <Text style={styles.waitingText}>Waiting for players to join...</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (createdGameId) {
                // Navigate to game even if not all players joined
                router.push(`/multiplayer-game?gameId=${createdGameId}`);
              }
            }}
          >
            <Text style={styles.actionButtonText}>Enter Lobby</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <React.Fragment>
          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>Match Type</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, !isLiveMatch && styles.toggleButtonActive]}
                onPress={() => setIsLiveMatch(false)}
              >
                <Text style={[styles.toggleText, !isLiveMatch && styles.toggleTextActive]}>
                  Async
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, isLiveMatch && styles.toggleButtonActive]}
                onPress={() => setIsLiveMatch(true)}
              >
                <Text style={[styles.toggleText, isLiveMatch && styles.toggleTextActive]}>
                  Live
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>Max Players</Text>
            <View style={styles.playerSelector}>
              {[2, 3, 4].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[styles.playerButton, maxPlayers === num && styles.playerButtonActive]}
                  onPress={() => setMaxPlayers(num)}
                >
                  <Text style={[styles.playerText, maxPlayers === num && styles.playerTextActive]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>Select Board</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.boardScroll}>
              {boards.map((board) => (
                <TouchableOpacity
                  key={board.id}
                  style={[
                    styles.boardCard,
                    selectedBoardId === board.id && styles.boardCardActive,
                  ]}
                  onPress={() => setSelectedBoardId(board.id)}
                >
                  <Text style={styles.boardName}>{board.name}</Text>
                  <Text style={styles.boardDifficulty}>{board.difficulty}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={[styles.actionButton, loading && styles.actionButtonDisabled]}
            onPress={handleCreatePrivateLobby}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <React.Fragment>
                <IconSymbol
                  ios_icon_name="plus.circle.fill"
                  android_material_icon_name="add-circle"
                  size={24}
                  color="#fff"
                />
                <Text style={styles.actionButtonText}>Create Lobby</Text>
              </React.Fragment>
            )}
          </TouchableOpacity>
        </React.Fragment>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => setMode(null)}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderJoinByCode = () => (
    <View style={styles.configContainer}>
      <Text style={styles.sectionTitle}>Join with Invite Code</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Enter Invite Code</Text>
        <TextInput
          style={styles.input}
          value={inviteCode}
          onChangeText={setInviteCode}
          placeholder="ABC123"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="characters"
          maxLength={8}
        />
      </View>

      <TouchableOpacity
        style={[styles.actionButton, loading && styles.actionButtonDisabled]}
        onPress={handleJoinByCode}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <React.Fragment>
            <IconSymbol
              ios_icon_name="arrow.right.circle.fill"
              android_material_icon_name="arrow-forward"
              size={24}
              color="#fff"
            />
            <Text style={styles.actionButtonText}>Join Game</Text>
          </React.Fragment>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => setMode(null)}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Multiplayer',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      {!mode && renderModeSelection()}
      {mode === 'random' && renderRandomMatchmaking()}
      {mode === 'private' && renderPrivateLobby()}
      {mode === 'invite' && renderJoinByCode()}

      <Modal
        visible={!!error}
        title="Error"
        message={error}
        onClose={() => setError('')}
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
  modeContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  modeButton: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modeGradient: {
    padding: 24,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  modeButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  configContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  optionGroup: {
    marginBottom: 24,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: '#fff',
  },
  playerSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  playerButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  playerButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.accent,
  },
  playerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  playerTextActive: {
    color: '#fff',
  },
  boardScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  boardCard: {
    width: 120,
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  boardCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.accent,
  },
  boardName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  boardDifficulty: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  inviteCodeContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  inviteCodeLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  inviteCodeBox: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  inviteCodeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 4,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  waitingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 2,
  },
});
