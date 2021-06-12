import Timer from "./timer";

class Animation {
    frames;
    name;
    speed /* millseconds */;
    timer;
    currentIndex;
    currentStepTime;
    shouldLoop;
    constructor(name, frames, speed, shouldLoop) {
        this.frames = frames;
        this.name = name;
        this.speed = speed;
        this.timer = new Timer();
        this.currentIndex = 0;
        this.currentStepTime = 0;
        this.shouldLoop = shouldLoop;
    }

    play() {
        this.currentStepTime = 0;
    }

    update(deltaTime) {
        this.currentStepTime += deltaTime;

        if (this.currentStepTime > this.speed) {
            this.currentStepTime = 0;
            this.incrementIndex();
        }
    }

    getCurrentFrame() {
        return this.frames[this.currentIndex];
    }

    getFrameAt(milliseconds, targetDuration) {
        let timeStep = targetDuration / this.frames.length;
        let frameIndex = Math.floor(milliseconds / timeStep);
        return this.frames[frameIndex];
    }

    stop() {
        this.currentStepTime = 0;
    }

    incrementIndex() {
        this.currentIndex += 1;

        if (this.currentIndex >= this.frames.length) {
            this.currentIndex = this.shouldLoop ? 0 : this.frames.length - 1;
        }
    }

}

export default Animation;