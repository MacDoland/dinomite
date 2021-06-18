import Animation from "./animation";

class SpriteSheet {
    #image;
    #animations;
    #randomFrames;
    #tiles;
    #config;

    constructor(imagePath, config, speed) {
        this.#image = document.createElement('img');
        this.#image.src = imagePath;
        this.#animations = {};
        this.#randomFrames = {};
        this.#tiles = {};
        this.#config = config;

        const splitName = (name) => {
            return name.includes('/')
            ? name.split('/')[0]
            : name;
        }


        const animationNames = config.frames.map((frame) => splitName(frame.filename));

        animationNames.forEach(animationName => {
            const animationFrames = config.frames
                .filter(frame => splitName(frame.filename) === animationName);

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

    getAnimationFrames(name) {
        return this.#config.frames.filter(frame => frame.filename.includes(name))
    }

    getRandomFrame(name, index) {
        if (!this.#tiles[name]) {
            this.#tiles[name] = {};
        }

        if (!this.#tiles[name][index]) {
            let randomTiles = this.#randomFrames[name];
            if (randomTiles) {
                try{
                this.#tiles[name][index] = randomTiles[Math.floor(Math.random() * randomTiles.length)];
                }
                catch(e){
                }
            }
            else {
                // console.log('no random frames')
            }
        }

        let sprite = this.#tiles[name][index];
        return sprite;
    }

    updateAnimations(deltaTime) {
        Object.keys(this.#animations).forEach(key => this.#animations[key].update(deltaTime));
    }
}

export default SpriteSheet;