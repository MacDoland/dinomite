import Timer from "./timer";

class Animation {
    frames;
    name;
    speed /* millseconds */;
    timer;
    currentIndex;
    currentStepTime;
    shouldLoop;
    delay;
    constructor(name, frames, speed, shouldLoop, delay = 0) {
        this.frames = frames;
        this.name = name;
        this.speed = speed;
        this.timer = new Timer();
        this.currentIndex = 0;
        this.currentStepTime = 0;
        this.shouldLoop = shouldLoop;
        this.delay = delay;
        this.startTime = new Date().getTime() + delay;
    }

    play() {
        this.currentStepTime = 0;
        this.startTime = new Date().getTime() + delay;
    }

    update(deltaTime) {
        if (new Date().getTime() >= this.startTime) {
            this.currentStepTime += deltaTime;

            if (this.currentStepTime > this.speed) {
                this.currentStepTime = 0;
                this.incrementIndex();
            }
        }
    }

    getCurrentFrame() {
        if (new Date().getTime() >= this.startTime) {
            return this.frames[this.currentIndex];
        }
        else {
            return null
        }
    }

    getFrameAt(milliseconds, targetDuration) {
        let timeStep = targetDuration / this.frames.length;
        let frameIndex = Math.floor(milliseconds / timeStep);
        return this.frames[frameIndex];
    }

    getFrameAtProgress(progress) {
        if (progress > 100) {
            progress = 100;
        }
        let frameIndex = Math.floor((progress / 100) * this.frames.length);
        return this.frames.length >= frameIndex ? this.frames[frameIndex - 1] : this.frames[this.frames.length - 1];
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