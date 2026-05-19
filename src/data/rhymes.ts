import type { RhymeQuestion } from './types';

export const RHYMES: RhymeQuestion[] = [
  { anchor: 'bed',  correct: 'red',  distractors: ['map', 'dog', 'sun'] },
  { anchor: 'band', correct: 'hand', distractors: ['pig', 'cup', 'leg'] },
  { anchor: 'stop', correct: 'top',  distractors: ['bat', 'pen', 'arm'] },
  { anchor: 'big',  correct: 'pig',  distractors: ['cat', 'mom', 'bed'] },
  { anchor: 'farm', correct: 'arm',  distractors: ['fox', 'pen', 'lid'] },
  { anchor: 'cat',  correct: 'bat',  distractors: ['son', 'pen', 'map'] },
  { anchor: 'man',  correct: 'can',  distractors: ['pig', 'arm', 'wet'] },
  { anchor: 'cup',  correct: 'pup',  distractors: ['leg', 'hen', 'man'] },
  { anchor: 'hen',  correct: 'pen',  distractors: ['box', 'arm', 'cat'] },
  { anchor: 'leg',  correct: 'beg',  distractors: ['fox', 'ant', 'mom'] },
];
