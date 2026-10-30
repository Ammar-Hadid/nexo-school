import { messageCategories } from './nexai-message-candidates';

type MessageCategory = (typeof messageCategories)[number]['id'];

function situation(category: MessageCategory, label: string) {
  const group = messageCategories.find((item) => item.id === category)!;
  return { label, pose: group.pose, messages: group.messages };
}

/** Approved copy and Rekenen 4.1 mappings; other contexts are examples, never detectors. */
export const nexaiSituations = {
  ready: situation('ready', 'Een som beantwoorden (ook bij een herhaling)'),
  firstCorrect: situation('firstCorrect', 'Goed in één keer'),
  firstIncorrect: situation('firstIncorrect', 'Eerste antwoord onjuist'),
  retryCorrect: situation('retryCorrect', 'Goed bij nog eens proberen'),
  explanation: situation('explanation', 'Tweede antwoord onjuist · uitleg'),
  complete: situation('complete', 'Taak klaar'),
  perfect: situation('perfect', 'Alles in één keer goed'),
  support: situation('support', 'Taak klaar · samen verder oefenen'),
  guardianReview: situation(
    'guardianReview',
    'Wachten op beoordeling door Ammar',
  ),
  effortConcern: situation('effortConcern', 'Voorstel · aandacht voor de taak'),
  overdueBlock: situation(
    'overdueBlock',
    'Voorstel · gepland oefenblok nog open',
  ),
};
export type NexaiSituation = keyof typeof nexaiSituations;
