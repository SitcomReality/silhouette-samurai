export class BeatClock {
  constructor(bpm = 120) {
    this.bpm = bpm;
    this.beatsPerSecond = bpm / 60;
    this.secondsPerBeat = 60 / bpm;
    this.secondsPer16th = this.secondsPerBeat / 4;
    this.startTime = 0;
  }

  start(audioContext) {
    this.startTime = audioContext.currentTime;
  }

  getCurrentBeat(audioContext) {
    const elapsed = audioContext.currentTime - this.startTime;
    return elapsed * this.beatsPerSecond;
  }

  snapToNext16th(audioContext, maxDelayMs = 50) {
    const currentTime = audioContext.currentTime;
    const elapsed = currentTime - this.startTime;
    const current16th = elapsed / this.secondsPer16th;
    const next16th = Math.ceil(current16th);
    const next16thTime = this.startTime + (next16th * this.secondsPer16th);
    const delay = next16thTime - currentTime;
    
    // If delay is too long, play immediately
    if (delay > maxDelayMs / 1000) {
      return currentTime;
    }
    
    return next16thTime;
  }
}