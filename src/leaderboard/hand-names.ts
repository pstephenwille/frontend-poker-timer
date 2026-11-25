import type { HandCategory } from '@pstephenwille/poker-timer-contracts';

const HAND_NAMES: Record<HandCategory, string> = {
  high_card: 'High Card',
  pair: 'Pair',
  two_pair: 'Two Pair',
  three_of_a_kind: 'Three of a Kind',
  straight: 'Straight',
  flush: 'Flush',
  full_house: 'Full House',
  four_of_a_kind: 'Four of a Kind',
  straight_flush: 'Straight Flush',
  royal_flush: 'Royal Flush',
};

export const handName = (hand: HandCategory) => HAND_NAMES[hand];
