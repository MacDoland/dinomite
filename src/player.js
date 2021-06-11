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
    #logger;
    #startPosition
    #name;

    constructor(name, startPosition, inputSystem, logger) {
        this.#name = name;
        this.#startPosition = startPosition;
        this.#inputSystem = inputSystem;
        this.#logger = logger;
        this.#direction = directions.DOWN;
        this.#position = new Vector(0, 0);
        this.#height = 50;
        this.#width = 50;
        this.#speed = 400;
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

    update(deltaTime) {

        let input = this.#inputSystem.update();

        this.#logger.log(`${this.#name} player input: `, input);


        let offset = new Vector(0, 0);

        if (input.DOWN) {
            offset.add(new Vector(0, this.#speed * deltaTime));
        }

        if (input.RIGHT) {
            offset.add(new Vector(this.#speed * deltaTime, 0))
        }

        if (input.UP) {
            offset.add(new Vector(0, -this.#speed * deltaTime))
        }

        if (input.LEFT) {
            offset.add(new Vector(-this.#speed * deltaTime, 0))
        }

        if (offset.y === 0 && offset.x === 0) {
            this.#state = PlayerState.IDLE;
        }


        this.#eventDispatcher.dispatch(this.#events.MOVE, {
            player: this,
            offset
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


        this.#logger.log(`${this.#name} player state: `, this.#state);
        this.#logger.log(`${this.#name} player direction: `, this.#direction);
        this.#position = Vector.add(this.#position, offset);
    }

    die() {
        console.log('deaders');
        this.#eventDispatcher.dispatch(this.#events.DEATH, this);
    }

    setPosition(newPosition) {
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

    getStartPosition() {
        return this.#startPosition;
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