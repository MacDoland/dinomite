
class SpriteSheet {
    #image;
    #sprites;

    constructor(imagePath) {
        this.#image = document.createElement('img');
        this.#image.src = imagePath;
        this.#sprites = {};
    }

    addSprite(key, x, y, width, height) {
        this.#sprites[key] = {
            image: this.#image,
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