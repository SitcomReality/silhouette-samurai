import { smin, sdCircle, sdCapsule } from './primitives.js';

export function evalSkeletonSDF(skel, px, py, blendK = 14) {
  let d = sdCircle(px, py, skel.head.x, skel.head.y, skel.headRadius);
  d = smin(d, sdCapsule(px, py, skel.torsoTop.x, skel.torsoTop.y, skel.torsoBottom.x, skel.torsoBottom.y, skel.torsoRadius), blendK);
  
  d = smin(d, sdCapsule(px, py, skel.leftShoulder.x, skel.leftShoulder.y, skel.leftElbow.x, skel.leftElbow.y, skel.armRadius), blendK);
  d = smin(d, sdCapsule(px, py, skel.leftElbow.x, skel.leftElbow.y, skel.leftHand.x, skel.leftHand.y, skel.armRadius), blendK);
  
  d = smin(d, sdCapsule(px, py, skel.rightShoulder.x, skel.rightShoulder.y, skel.rightElbow.x, skel.rightElbow.y, skel.armRadius), blendK);
  d = smin(d, sdCapsule(px, py, skel.rightElbow.x, skel.rightElbow.y, skel.rightHand.x, skel.rightHand.y, skel.armRadius), blendK);
  
  d = smin(d, sdCapsule(px, py, skel.leftHip.x, skel.leftHip.y, skel.leftKnee.x, skel.leftKnee.y, skel.legRadius), blendK);
  d = smin(d, sdCapsule(px, py, skel.leftKnee.x, skel.leftKnee.y, skel.leftFoot.x, skel.leftFoot.y, skel.legRadius), blendK);
  
  d = smin(d, sdCapsule(px, py, skel.rightHip.x, skel.rightHip.y, skel.rightKnee.x, skel.rightKnee.y, skel.legRadius), blendK);
  d = smin(d, sdCapsule(px, py, skel.rightKnee.x, skel.rightKnee.y, skel.rightFoot.x, skel.rightFoot.y, skel.legRadius), blendK);
  
  return d;
}