export function createDefaultSkeleton(x, y) {
  return {
    head: { x, y: y - 110 },
    headRadius: 14,
    torsoTop: { x, y: y - 90 },
    torsoBottom: { x, y: y - 50 },
    torsoRadius: 10,
    leftShoulder: { x: x - 5, y: y - 90 },
    leftElbow: { x: x - 10, y: y - 70 },
    leftHand: { x: x - 10, y: y - 50 },
    armRadius: 7,
    rightShoulder: { x: x + 5, y: y - 90 },
    rightElbow: { x: x + 10, y: y - 70 },
    rightHand: { x: x + 10, y: y - 50 },
    leftHip: { x: x - 6, y: y - 50 },
    leftKnee: { x: x - 10, y: y - 25 },
    leftFoot: { x: x - 12, y },
    legRadius: 8,
    rightHip: { x: x + 6, y: y - 50 },
    rightKnee: { x: x + 10, y: y - 25 },
    rightFoot: { x: x + 12, y },
  };
}