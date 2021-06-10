import Animation from "./animation";

class SpriteSheet {
    #image;
    #animations;
    #randomFrames;
    #tiles;

    constructor(imagePath, config, speed) {
        this.#image = document.createElement('img');
        this.#image.src = imagePath;
        this.#animations = {};
        this.#randomFrames = {};
        this.#tiles = {};


        const animationNames = config.frames.map((frame) => {
            return frame.filename.includes('/')
                ? frame.filename.split('/')[0]
                : frame.filename;
        });

        animationNames.forEach(animationName => {
            const animationFrames = config.frames
                .filter(frame => frame.filename.includes(animationName));

            if (animationName.includes('random')) {
                this.#randomFrames[animationName] = animationFrames;
            }
            else {
                this.#animations[animationName] = new Animation(animationName, animationFrames, speed, animationName.includes('loop'));
            }
        });
    }

    getImage() {
        return this.#image;
    }

    getAnimation(name) {
        return this.#animations[name];
    }

    getRandomFrame(name, index) {
        if (!this.#tiles[index]) {
            let randomTiles =  this.#randomFrames[name];
            this.#tiles[index] = randomTiles[Math.floor(Math.random() * randomTiles.length)];
        }

        return this.#tiles[index];
    }

    updateAnimations(deltaTime) {
        Object.keys(this.#animations).forEach(key => this.#animations[key].update(deltaTime));
    }
}

export default SpriteSheet;