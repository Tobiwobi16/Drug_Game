// Centralized story state and Bob's dialogue tree
export interface StoryState {
  bobContacted: boolean;
  currentBobNode: string;
  charlesIntroduced: boolean;
  charlesHealth: number; // 0 - 100
  charlesCondition: 'weak' | 'tired' | 'stable';
  treatmentStatus: 'pending' | 'administered';
  lastTreatmentDay: number;
  charlesPettedCount: number;
  lastPettedTimestamp: number;
  parkUnlocked: boolean; // Always false in this version
}

export interface DialogueChoice {
  id: string;
  text: string;
  nextNodeId: string;
}

export interface DialogueNode {
  id: string;
  sender: 'Bob';
  message: string;
  choices: DialogueChoice[];
}

export interface StoryMessage {
  id: string;
  sender: 'Bob' | 'Player';
  text: string;
  time: string;
}

// Initial story state
export const initialStoryState: StoryState = {
  bobContacted: true,
  currentBobNode: 'node-start',
  charlesIntroduced: true,
  charlesHealth: 62,
  charlesCondition: 'weak',
  treatmentStatus: 'pending',
  lastTreatmentDay: 1,
  charlesPettedCount: 0,
  lastPettedTimestamp: 0,
  parkUnlocked: false, // Park is strictly not unlocked yet
};

// Dialogue Tree for Bob's conversation
export const BOB_DIALOGUE_TREE: Record<string, DialogueNode> = {
  'node-start': {
    id: 'node-start',
    sender: 'Bob',
    message: "Yo, it's been a minute. You still living around here?",
    choices: [
      {
        id: 'c1-1',
        text: 'Yeah, what\'s up?',
        nextNodeId: 'node-choice1-reply',
      },
      {
        id: 'c1-2',
        text: 'Bob? Damn, haven\'t heard from you in years.',
        nextNodeId: 'node-choice2-reply',
      },
      {
        id: 'c1-3',
        text: 'Who is this?',
        nextNodeId: 'node-choice3-reply',
      },
    ],
  },
  'node-choice1-reply': {
    id: 'node-choice1-reply',
    sender: 'Bob',
    message: 'I saw something about your cat on Cakebook. We should talk.',
    choices: [
      {
        id: 'c2-1',
        text: 'Wait, you saw the post about Charles?',
        nextNodeId: 'node-cat-details',
      },
      {
        id: 'c2-2',
        text: 'He\'s not doing good, man. The vet bills are killing me.',
        nextNodeId: 'node-cat-details',
      },
      {
        id: 'c2-3',
        text: 'Why are you looking up my Cakebook?',
        nextNodeId: 'node-cat-details',
      },
    ],
  },
  'node-choice2-reply': {
    id: 'node-choice2-reply',
    sender: 'Bob',
    message: 'Yeah bro, it\'s been forever. I actually need to talk to you about something.',
    choices: [
      {
        id: 'c2-4',
        text: 'What kind of something?',
        nextNodeId: 'node-cat-mention',
      },
      {
        id: 'c2-5',
        text: 'I saw your message right as I was checking on Charles.',
        nextNodeId: 'node-cat-details',
      },
    ],
  },
  'node-choice3-reply': {
    id: 'node-choice3-reply',
    sender: 'Bob',
    message: 'Bro 😭 it\'s Bob. From high school. I saw your post about your cat.',
    choices: [
      {
        id: 'c2-6',
        text: 'Oh, Bob! Sorry, new number. You saw the post about Charles?',
        nextNodeId: 'node-cat-details',
      },
      {
        id: 'c2-7',
        text: 'Yeah, things have been tough lately with Charles.',
        nextNodeId: 'node-cat-details',
      },
    ],
  },
  'node-cat-mention': {
    id: 'node-cat-mention',
    sender: 'Bob',
    message: 'I saw your post on Cakebook about your cat Charles. Said he got diagnosed with cancer?',
    choices: [
      {
        id: 'c3-1',
        text: 'Yeah... the daily treatments cost more than my rent.',
        nextNodeId: 'node-proposition',
      },
      {
        id: 'c3-2',
        text: 'He\'s hanging in there, but I don\'t know how much longer I can pay for his meds.',
        nextNodeId: 'node-proposition',
      },
    ],
  },
  'node-cat-details': {
    id: 'node-cat-details',
    sender: 'Bob',
    message: 'Sucks about Charles, man. Cancer is rough. I saw the fundraiser you put up. Didn\'t look like it was hitting the goal.',
    choices: [
      {
        id: 'c3-3',
        text: 'It\'s nowhere close. I\'m running out of options.',
        nextNodeId: 'node-proposition',
      },
      {
        id: 'c3-4',
        text: 'Why do you care, Bob? What\'s this about?',
        nextNodeId: 'node-proposition',
      },
    ],
  },
  'node-proposition': {
    id: 'node-proposition',
    sender: 'Bob',
    message: 'Look, I might have a way for you to make some quick cash. Serious money. Enough to cover his meds and then some.',
    choices: [
      {
        id: 'c4-1',
        text: 'What kind of money? Is this legal?',
        nextNodeId: 'node-park-conclusion',
      },
      {
        id: 'c4-2',
        text: 'I\'m listening. What do I have to do?',
        nextNodeId: 'node-park-conclusion',
      },
      {
        id: 'c4-3',
        text: 'I can\'t get into trouble, Bob. Charles needs me.',
        nextNodeId: 'node-park-conclusion',
      },
    ],
  },
  'node-park-conclusion': {
    id: 'node-park-conclusion',
    sender: 'Bob',
    message: 'Can\'t talk about details over text. Meet me at the park near your apartment block. Come alone. Don\'t keep me waiting.',
    choices: [], // End of initial conversation
  },
};
