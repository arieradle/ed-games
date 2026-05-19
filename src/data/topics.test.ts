import { getWords, shuffle, pick, TOPICS } from './topics';

describe('getWords', () => {
  it('returns words for a known topic', () => {
    const words = getWords('family');
    expect(words.length).toBeGreaterThan(0);
    expect(words[0]).toHaveProperty('word');
    expect(words[0]).toHaveProperty('emoji');
    expect(words[0]).toHaveProperty('hint');
  });

  it('returns the family topic words', () => {
    const words = getWords('family');
    const wordStrings = words.map(w => w.word);
    expect(wordStrings).toContain('mom');
    expect(wordStrings).toContain('dad');
  });

  it('falls back to all words for unknown topic', () => {
    const allWords = getWords('all');
    const unknownWords = getWords('nonexistent_topic_xyz');
    expect(unknownWords.length).toBe(allWords.length);
  });

  it('returns words for all built-in topics', () => {
    const topicKeys = Object.keys(TOPICS).filter(k => k !== 'all');
    topicKeys.forEach(key => {
      const words = getWords(key);
      expect(words.length).toBeGreaterThan(0);
    });
  });

  it('all topic includes words from all other topics', () => {
    const allWords = getWords('all');
    const familyWords = getWords('family');
    familyWords.forEach(w => {
      expect(allWords.some(aw => aw.word === w.word)).toBe(true);
    });
  });
});

describe('shuffle', () => {
  it('returns an array of the same length', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr);
    expect(result.length).toBe(arr.length);
  });

  it('returns a new array (does not mutate original)', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr);
    expect(result).not.toBe(arr);
  });

  it('contains the same elements', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = shuffle(arr);
    expect(result.sort()).toEqual(arr.sort());
  });

  it('handles empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('handles single element array', () => {
    expect(shuffle([42])).toEqual([42]);
  });

  it('works with string arrays', () => {
    const arr = ['a', 'b', 'c', 'd'];
    const result = shuffle(arr);
    expect(result.sort()).toEqual(['a', 'b', 'c', 'd']);
  });
});

describe('pick', () => {
  it('returns exactly n items', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = pick(arr, 4);
    expect(result.length).toBe(4);
  });

  it('returns items that are all from the original array', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = pick(arr, 3);
    result.forEach(item => {
      expect(arr).toContain(item);
    });
  });

  it('returns no duplicates when picking fewer than array length', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = pick(arr, 3);
    const unique = new Set(result);
    expect(unique.size).toBe(3);
  });

  it('handles picking all elements', () => {
    const arr = [1, 2, 3];
    const result = pick(arr, 3);
    expect(result.length).toBe(3);
    expect(result.sort()).toEqual([1, 2, 3]);
  });

  it('handles picking 0 elements', () => {
    const arr = [1, 2, 3];
    expect(pick(arr, 0)).toEqual([]);
  });
});
