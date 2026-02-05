
import { authenticatedGet, apiGet, apiPost, apiPut, apiDelete } from './api';
import { BoardMetadata, BoardListItem, PlayMode, Difficulty, BoardTile, WinCondition } from '@/types/game';

/**
 * Fetches all boards with optional filtering
 */
export async function fetchBoards(params?: {
  mode?: PlayMode;
  difficulty?: Difficulty;
  limit?: number;
  offset?: number;
}): Promise<{ boards: BoardListItem[]; total: number }> {
  console.log('[BoardAPI] Fetching boards with params:', params);
  
  const queryParams = new URLSearchParams();
  if (params?.mode) queryParams.append('mode', params.mode);
  if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());
  
  const queryString = queryParams.toString();
  const endpoint = `/api/boards${queryString ? `?${queryString}` : ''}`;
  
  try {
    const response = await apiGet<{ boards: BoardListItem[]; total: number }>(endpoint);
    console.log('[BoardAPI] Boards fetched successfully:', response.boards?.length || 0);
    return response;
  } catch (error) {
    console.error('[BoardAPI] Failed to fetch boards:', error);
    throw error;
  }
}

/**
 * Fetches a specific board by ID with full details
 */
export async function fetchBoardById(boardId: string): Promise<BoardMetadata> {
  console.log('[BoardAPI] Fetching board by ID:', boardId);
  
  try {
    const response = await apiGet<BoardMetadata>(`/api/boards/${boardId}`);
    console.log('[BoardAPI] Board fetched successfully:', response.name);
    return response;
  } catch (error) {
    console.error('[BoardAPI] Failed to fetch board:', error);
    throw error;
  }
}

/**
 * Fetches a random board matching the criteria
 */
export async function fetchRandomBoard(params?: {
  mode?: PlayMode;
  difficulty?: Difficulty;
}): Promise<BoardMetadata> {
  console.log('[BoardAPI] Fetching random board with params:', params);
  
  const queryParams = new URLSearchParams();
  if (params?.mode) queryParams.append('mode', params.mode);
  if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
  
  const queryString = queryParams.toString();
  const endpoint = `/api/boards/random${queryString ? `?${queryString}` : ''}`;
  
  try {
    const response = await apiGet<BoardMetadata>(endpoint);
    console.log('[BoardAPI] Random board fetched successfully:', response.name);
    return response;
  } catch (error) {
    console.error('[BoardAPI] Failed to fetch random board:', error);
    throw error;
  }
}

/**
 * Seeds the database with example boards (admin function)
 */
export async function seedBoards(): Promise<{ message: string; count: number }> {
  console.log('[BoardAPI] Seeding boards...');
  
  try {
    const response = await apiPost<{ message: string; count: number }>('/api/boards/seed', {});
    console.log('[BoardAPI] Boards seeded successfully:', response.message);
    return response;
  } catch (error) {
    console.error('[BoardAPI] Failed to seed boards:', error);
    throw error;
  }
}

/**
 * Creates a new board (admin function)
 */
export async function createBoard(boardData: {
  name: string;
  supportedModes: PlayMode[];
  gridSize: 7 | 9;
  initialLayout: BoardTile[][];
  puzzleMode: string;
  winCondition: WinCondition;
  difficulty: Difficulty;
  tags?: string[];
}): Promise<BoardMetadata> {
  console.log('[BoardAPI] Creating new board:', boardData.name);
  
  try {
    const response = await apiPost<BoardMetadata>('/api/boards', boardData);
    console.log('[BoardAPI] Board created successfully:', response.id);
    return response;
  } catch (error) {
    console.error('[BoardAPI] Failed to create board:', error);
    throw error;
  }
}

/**
 * Updates an existing board (admin function)
 */
export async function updateBoard(
  boardId: string,
  updates: Partial<{
    name: string;
    supportedModes: PlayMode[];
    gridSize: 7 | 9;
    initialLayout: BoardTile[][];
    puzzleMode: string;
    winCondition: WinCondition;
    difficulty: Difficulty;
    tags: string[];
    isActive: boolean;
  }>
): Promise<BoardMetadata> {
  console.log('[BoardAPI] Updating board:', boardId);
  
  try {
    const response = await apiPut<BoardMetadata>(`/api/boards/${boardId}`, updates);
    console.log('[BoardAPI] Board updated successfully:', response.id);
    return response;
  } catch (error) {
    console.error('[BoardAPI] Failed to update board:', error);
    throw error;
  }
}

/**
 * Deletes a board (soft delete - sets isActive to false) (admin function)
 */
export async function deleteBoard(boardId: string): Promise<{ success: boolean }> {
  console.log('[BoardAPI] Deleting board:', boardId);
  
  try {
    const response = await apiDelete<{ success: boolean }>(`/api/boards/${boardId}`, {});
    console.log('[BoardAPI] Board deleted successfully:', boardId);
    return response;
  } catch (error) {
    console.error('[BoardAPI] Failed to delete board:', error);
    throw error;
  }
}
