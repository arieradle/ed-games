import type { Topic, Word } from './types';

export const TOPICS: Record<string, Topic> = {
  all:      { label: '🌍 All',         he: 'הכל',         words: [] },
  family:   { label: '👨‍👩‍👧 Family',    he: 'משפחה',       words: [
    { word: 'mom',     emoji: '👩',  hint: 'אמא' },    { word: 'dad',     emoji: '👨',  hint: 'אבא' },
    { word: 'son',     emoji: '👦',  hint: 'בן' },     { word: 'baby',    emoji: '👶',  hint: 'תינוק' },
    { word: 'girl',    emoji: '👧',  hint: 'ילדה' },   { word: 'boy',     emoji: '🧒',  hint: 'ילד' },
    { word: 'sister',  emoji: '👭',  hint: 'אחות' },   { word: 'brother', emoji: '👬',  hint: 'אח' },
    { word: 'gran',    emoji: '👵',  hint: 'סבתא' },   { word: 'grandpa', emoji: '👴',  hint: 'סבא' },
  ]},
  classroom:{ label: '📚 Classroom',   he: 'כיתה',        words: [
    { word: 'pen',     emoji: '🖊️', hint: 'עט' },     { word: 'book',    emoji: '📖', hint: 'ספר' },
    { word: 'bag',     emoji: '🎒', hint: 'תיק' },    { word: 'map',     emoji: '🗺️', hint: 'מפה' },
    { word: 'cup',     emoji: '☕', hint: 'כוס' },    { word: 'box',     emoji: '📦', hint: 'קופסה' },
    { word: 'desk',    emoji: '🪑', hint: 'שולחן' },  { word: 'flag',    emoji: '🚩', hint: 'דגל' },
    { word: 'rug',     emoji: '🟫', hint: 'שטיח' },   { word: 'pin',     emoji: '📌', hint: 'סיכה' },
  ]},
  animals:  { label: '🐾 Animals',     he: 'בעלי חיים',   words: [
    { word: 'cat',     emoji: '🐱', hint: 'חתול' },   { word: 'dog',     emoji: '🐶', hint: 'כלב' },
    { word: 'hen',     emoji: '🐔', hint: 'תרנגולת' },{ word: 'pig',     emoji: '🐷', hint: 'חזיר' },
    { word: 'ant',     emoji: '🐜', hint: 'נמלה' },   { word: 'bat',     emoji: '🦇', hint: 'עטלף' },
    { word: 'fox',     emoji: '🦊', hint: 'שועל' },   { word: 'rat',     emoji: '🐀', hint: 'עכבר' },
    { word: 'bug',     emoji: '🐛', hint: 'חרק' },    { word: 'ox',      emoji: '🐂', hint: 'שור' },
    { word: 'ram',     emoji: '🐏', hint: 'איל' },    { word: 'fish',    emoji: '🐟', hint: 'דג' },
    { word: 'bird',    emoji: '🐦', hint: 'ציפור' },  { word: 'cub',     emoji: '🐻', hint: 'גור' },
  ]},
  body:     { label: '🧍 My Body',     he: 'הגוף שלי',    words: [
    { word: 'arm',     emoji: '💪', hint: 'זרוע' },   { word: 'leg',     emoji: '🦵', hint: 'רגל' },
    { word: 'lip',     emoji: '👄', hint: 'שפה' },    { word: 'ear',     emoji: '👂', hint: 'אוזן' },
    { word: 'eye',     emoji: '👁️', hint: 'עין' },   { word: 'toe',     emoji: '🦶', hint: 'בוהן' },
    { word: 'jaw',     emoji: '😬', hint: 'לסת' },    { word: 'hip',     emoji: '🕺', hint: 'ירך' },
    { word: 'hand',    emoji: '✋', hint: 'יד' },     { word: 'nose',    emoji: '👃', hint: 'אף' },
    { word: 'chin',    emoji: '🤭', hint: 'סנטר' },   { word: 'neck',    emoji: '🦒', hint: 'צוואר' },
  ]},
  unit4:    { label: '📝 Unit 4',      he: 'יחידה 4',     words: [
    { word: 'stop',    emoji: '🛑', hint: 'עצור' },   { word: 'swim',    emoji: '🏊', hint: 'לשחות' },
    { word: 'man',     emoji: '🧔', hint: 'גבר' },    { word: 'zero',    emoji: '0️⃣',hint: 'אפס' },
    { word: 'open',    emoji: '🚪', hint: 'לפתוח' },  { word: 'rest',    emoji: '😴', hint: 'לנוח' },
    { word: 'wet',     emoji: '💧', hint: 'רטוב' },   { word: 'camp',    emoji: '⛺', hint: 'מחנה' },
    { word: 'wind',    emoji: '💨', hint: 'רוח' },    { word: 'bed',     emoji: '🛏️',hint: 'מיטה' },
    { word: 'farm',    emoji: '🌾', hint: 'חווה' },   { word: 'soft',    emoji: '🪶', hint: 'רך' },
    { word: 'best',    emoji: '🏆', hint: 'הכי טוב' },{ word: 'gift',    emoji: '🎁', hint: 'מתנה' },
    { word: 'lift',    emoji: '🏋️',hint: 'להרים' },  { word: 'sand',    emoji: '🏖️',hint: 'חול' },
  ]},
};

// build "all" words list
const topicKeys = Object.keys(TOPICS).filter(k => k !== 'all') as Array<keyof typeof TOPICS>;
TOPICS.all.words = topicKeys.flatMap(k => TOPICS[k].words);

export function getWords(topic: string): Word[] {
  return (TOPICS[topic] ?? TOPICS.all).words;
}

export function shuffle<T>(arr: T[]): T[] {
  const b = [...arr];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export function pick<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}
