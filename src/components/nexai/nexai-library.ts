import catalogue from './nexai-layered-catalogue.json';

export type NexaiMood =
  | 'calm'
  | 'happy'
  | 'proud'
  | 'celebrate'
  | 'curious'
  | 'encourage'
  | 'sad'
  | 'angry';
export type NexaiPoseId = `${NexaiMood}-${1 | 2 | 3}`;
/** Approved artwork/motion catalogue, deliberately independent of product events. */
export const nexaiLibrary = catalogue;
export function nexaiPose(id: NexaiPoseId) {
  return catalogue.find((pose) => pose.id === id) ?? catalogue[0]!;
}
