import directions, { directionAsVector, getDirectionOpposite } from './helpers/direction';
import Rectangle from './structures/rectangle';
import Vector from './structures/vector';
import EventDispatcher from "./helpers/event-dispatcher";
import Timer from './helpers/timer';
import Grid from './structures/grid';
import { convertIndexToCoordinate } from './helpers/grid-helpers';

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
    #startPosition
    #characterIndex;
    #id;
    #timeOfDeath;

    constructor(id, characterIndex, startPosition) {
        this.#id = id;
        this.#characterIndex = characterIndex;
        this.#startPosition = startPosition;
        this.#direction = directions.DOWN;
        this.#position = new Vector(0, 0);
        this.#height = 64;
        this.#width = 64;
        this.#origin = new Vector(0, 0);
        this.#state = PlayerState.IDLE;
        this.#boundingBox = new Rectangle(this.#origin, this.#width, this.#height);
        this.#eventDispatcher = new EventDispatcher();
        this.#events = {
            MOVE: 'MOVE',
            DEATH: 'DEATH'
        };
        Object.freeze(this.#events);
    }

    getId() {
        return this.#id;
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
        this.#timeOfDeath = new Date();
        this.#state = PlayerState.DEATH;
        this.#eventDispatcher.dispatch(this.#events.DEATH, this);
    }

    getTimeOfDeath() {
        return this.#timeOfDeath;
    }

    setTimeOfDeath( timeOfDeath) {
        this.#timeOfDeath = timeOfDeath;
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

    setDirection(direction) {
        this.#direction = direction;
    }


    getPosition() {
        return Vector.add(this.#position, this.#origin);
    }

    getBombPosition() {
        let oppositeDirection = getDirectionOpposite(this.#direction);
        let offset = directionAsVector(oppositeDirection);

        if(oppositeDirection === directions.LEFT || oppositeDirection === directions.RIGHT){
            offset.multiplyScalar(this.#width / 2);
        }
        else if(oppositeDirection === directions.UP || oppositeDirection === directions.DOWN){
            offset.multiplyScalar(this.#height / 2);
        }

        return Vector.add(this.#position, offset);
    }

    getBoundingBox() {
        return this.#boundingBox;
    }

    respawn(){
        
        this.setPosition(convertIndexToCoordinate(this.#startPosition, 15, 15).multiplyScalar(100).add(new Vector(50, 50)));
        this.#state = PlayerState.IDLE;

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
    WALKING: 'WALKING',
    DEATH: 'DEATH'
}

export default Player;