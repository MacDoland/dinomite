
class SpriteSheet {
    #spriteSheet;
    #sprites;

    constructor(imagePath) {
        this.#spriteSheet = document.createElement('img');
        this.#spriteSheet.src = imagePath;
        this.#sprites = {};
    }

    addSprite(key, x, y, width, height) {
        this.#sprites[key] = {
            spriteSheet: this.#spriteSheet,
            x,
            y,
            width,
            height
        };
    }

    getSprite(key) {
        return this.#sprites[key];
    }
}

export default SpriteSheet;