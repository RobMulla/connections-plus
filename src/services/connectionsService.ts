import { ConnectionPuzzle } from '../types/connections';

const CONNECTIONS_DATA_URL = 'https://raw.githubusercontent.com/Eyefyre/NYT-Connections-Answers/main/connections.json';

export const fetchAllPuzzles = async (): Promise<ConnectionPuzzle[]> => {
  try {
    const response = await fetch(CONNECTIONS_DATA_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch connections data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching connections data:', error);
    throw error;
  }
};

export const fetchPuzzleByDate = async (date: string): Promise<ConnectionPuzzle | undefined> => {
  const allPuzzles = await fetchAllPuzzles();
  return allPuzzles.find(puzzle => puzzle.date === date);
};

export const getRandomPuzzle = async (): Promise<ConnectionPuzzle> => {
  const allPuzzles = await fetchAllPuzzles();
  const randomIndex = Math.floor(Math.random() * allPuzzles.length);
  return allPuzzles[randomIndex];
};

export const getAvailableDates = async (): Promise<string[]> => {
  const allPuzzles = await fetchAllPuzzles();
  return allPuzzles.map(puzzle => puzzle.date).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
}; 