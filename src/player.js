import Vector from './structures/vector';

class Player {
    #position;
    #origin;
    #width;
    #height;
    constructor() {
        this.#position = new Vector(0, 0);
        this.#height = 50;
        this.#width = 50;
        this.#origin = new Vector(0, -this.#height);
    }

    move(position) {
        this.#position = position;
    }

    getPosition() {
        return Vector.add(this.#position, this.#origin);
    }
    getWidth() {
        return this.#width;
    }
    getHeight() {
        return this.#height;
    }
}

export default Player;