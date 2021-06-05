import Timer from "./timer";

class Animation {
    frames;
    spriteSheet;
    name;
    speed /* millseconds */;
    timer;
    currentIndex;
    currentStepTime;
    constructor (spriteSheet, name, frames, speed) {
        this.spriteSheet = spriteSheet;
        this.frames = frames;
        this.name = name;
        this.speed = speed;
        this.timer = new Timer();
        this.currentIndex = 0;
        this.currentStepTime = 0;
    }

    play() {
        this.currentStepTime = 0;
    }

    update (deltaTime){
        this.currentStepTime += deltaTime;

        if(this.currentStepTime >= this.speed) {
            this.currentStepTime = 0;
            this.incrementIndex();
        }
    }

    getCurrentFrame(){
        return this.frames[this.currentIndex];
    }

    stop () {
        this.currentStepTime = 0;
    }

    incrementIndex(){
        this.currentIndex+=1;

        if(this.currentIndex >= this.frames.length){
            this.currentIndex = 0;
        }
    }

}

export default Animation;