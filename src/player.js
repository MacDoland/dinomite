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
    #eventDispatcher;
    #events;

    constructor() {
        this.#direction = directions.DOWN;
        this.#position = new Vector(0, 0);
        this.#height = 50;
        this.#width = 50;
        this.#origin = new Vector(0, 0);
        this.#state = PlayerState.IDLE;
        this.#boundingBox = new Rectangle(this.#origin, 60, 60);
        this.#eventDispatcher = new EventDispatcher();
        this.#events = {
            MOVE: 'MOVE',
            DEATH: 'DEATH'
        }
        Object.freeze(this.#events);
    }

    update() {
        this.#state = PlayerState.IDLE;
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

        this.#position = Vector.add(this.#position, offset);
    }

    die(){
        console.log('deaders');
        this.#eventDispatcher.dispatch(this.#events.DEATH);
    }

    setPosition(newPosition){
        this.#position = newPosition;
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