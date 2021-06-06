import Animation from "./animation";

class SpriteSheet {
    #image;
    #animations;

    constructor(imagePath, config, speed) {
        this.#image = document.createElement('img');
        this.#image.src = imagePath;
        this.#animations = {};

        const animationNames = config.frames.map((frame) => {
            return frame.filename.includes('/')
                ? frame.filename.split('/')[0]
                : frame.filename;
        });

        animationNames.forEach(animationName => {
            const animationFrames = config.frames
                .filter(frame => frame.filename.includes(animationName));

              this.#animations[animationName] = new Animation(animationName, animationFrames, speed);
        });
    }

    getImage(){
        return this.#image;
    }
    
    getAnimation(name) {
        return this.#animations[name];
    }

    updateAnimations(deltaTime) {
        Object.keys(this.#animations).forEach(key => this.#animations[key].update(deltaTime));
    }
}

export default SpriteSheet;