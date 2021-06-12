import directions from './helpers/direction';
import Rectangle from './structures/rectangle';
import Vector from './structures/vector';
import EventDispatcher from "./helpers/event-dispatcher";

class Player {
    #position;
    #direction;
    #origin;
    #width;
    #height;
    #state;
    #boundingBox;
    #inputSystem;
    #eventDispatcher;
    #events;
    #speed;
    #startPosition
    #name;
    #characterIndex;
    #id;
    #size;

    constructor(id, name, characterIndex, startPosition, inputSystem) {
        this.#id = id;
        this.#name = name;
        this.#characterIndex = characterIndex;
        this.#startPosition = startPosition;
        this.#inputSystem = inputSystem;
        this.#direction = directions.DOWN;
        this.#position = new Vector(0, 0);
        this.#height = 50;
        this.#width = 50;
        this.#speed = 400;
        this.#origin = new Vector(0, 0);
        this.#state = PlayerState.IDLE;
        this.#size = 60;
        this.#boundingBox = new Rectangle(this.#origin, 60, 60);
        this.#eventDispatcher = new EventDispatcher();
        this.#events = {
            MOVE: 'MOVE',
            DEATH: 'DEATH'
        }
        Object.freeze(this.#events);
    }

    getId() {
        return this.#id;
    }

    update(deltaTime) {

        let input = this.#inputSystem.update();

        let offset = new Vector(0, 0);

        if (input.current.DOWN) {
            offset.add(new Vector(0, this.#speed * deltaTime));
        }

        if (input.current.RIGHT) {
            offset.add(new Vector(this.#speed * deltaTime, 0))
        }

        if (input.current.UP) {
            offset.add(new Vector(0, -this.#speed * deltaTime))
        }

        if (input.current.LEFT) {
            offset.add(new Vector(-this.#speed * deltaTime, 0))
        }

        if (offset.y === 0 && offset.x === 0) {
            this.#state = PlayerState.IDLE;
        }

        this.#eventDispatcher.dispatch(this.#events.MOVE, {
            player: this,
            offset,
            id: this.#id
        });
    }

    move(offset) {

        if (offset.x < 0) {
            this.#direction = directions.LEFT;
            this.#state = PlayerState.WALKING;
        }

        if (offset.x > 0) {
            this.#direction = directions.RIGHT;
            this.#state = PlayerState.WALKING;
        }

        if (offset.y < 0) {
            this.#direction = directions.UP;
            this.#state = PlayerState.WALKING;
        }

        if (offset.y > 0) {
            this.#direction = directions.DOWN;
            this.#state = PlayerState.WALKING;
        }

        if (offset.x === 0 && offset.y === 0) {
            this.#state = PlayerState.IDLE;
        }

        this.#position = Vector.add(this.#position, offset);
    }

    die() {
        this.#eventDispatcher.dispatch(this.#events.DEATH, this);
    }

    setPosition(newPosition) {
        this.#position = newPosition;
    }

    getCharacterIndex() {
        return this.#characterIndex;
    }

    getDirection() {
        return this.#direction;
    }

    getPosition() {
        return Vector.add(this.#position, this.#origin);
    }
    getBoundingBox() {
        return this.#boundingBox;
    }

    getBounds() {
        return {
            topLeft: this.getTopLeft(),
            topRight: this.getTopRight(),
            bottomLeft: this.getBottomLeft(),
            bottomRight: this.getBottomRight()
        }
    }

    getGlobalBoundingBox() {
        return Rectangle.move(this.#boundingBox, this.#position);
    }
    getState() {
        return this.#state;
    }
    getWidth() {
        return this.#width;
    }
    getHeight() {
        return this.#height;
    }

    getTopLeft() {
        return Vector.add(this.#position, this.#boundingBox.getTopLeft());
    }

    getTopRight() {
        return Vector.add(this.#position, this.#boundingBox.getTopRight());
    }

    getBottomLeft() {
        return Vector.add(this.#position, this.#boundingBox.getBottomLeft());
    }

    getBottomRight() {
        return Vector.add(this.#position, this.#boundingBox.getBottomRight());
    }

    getStartPosition() {
        return this.#startPosition;
    }

    setState(state) {
        this.#state = state;
    }

    /* Events */
    onMove(handler) {
        this.#eventDispatcher.registerHandler(this.#events.MOVE, handler);
    }

    removeOnMove(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.MOVE, handler);
    }

    onDeath(handler) {
        this.#eventDispatcher.registerHandler(this.#events.DEATH, handler);
    }

    removeOnDeath(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.DEATH, handler);
    }
}


export const PlayerState = {
    IDLE: 'IDLE',
    WALKING: 'WALKING'
}

export default Player;