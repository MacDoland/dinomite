import directions from './helpers/direction';
import Rectangle from './structures/rectangle';
import Vector from './structures/vector';

class Player {
    #position;
    #direction;
    #origin;
    #width;
    #height;
    #state;
    #boundingBox;
    constructor() {
        this.#direction = directions.DOWN;
        this.#position = new Vector(0, 0);
        this.#height = 50;
        this.#width = 50;
        this.#origin = new Vector(0,0);
        this.#state = PlayerState.IDLE;
        this.#boundingBox = new Rectangle(new Vector(), 0, 0);
    }

    update(){
        this.#state = PlayerState.IDLE;
    }

    move(offset) {
        if(offset.x < 0){
            this.#direction = directions.LEFT;
            this.#state = PlayerState.WALKING;
        }

        if(offset.x > 0){
            this.#direction = directions.RIGHT;
            this.#state = PlayerState.WALKING;
        }

        if(offset.y < 0){
            this.#direction = directions.UP;
            this.#state = PlayerState.WALKING;
        }

        if(offset.y > 0){
            this.#direction = directions.DOWN;
            this.#state = PlayerState.WALKING;
        }

        this.#position = Vector.add(this.#position, offset);
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
    getState() {
        return this.#state;
    }
    getWidth() {
        return this.#width;
    }
    getHeight() {
        return this.#height;
    }

    
}


export const PlayerState = {
    IDLE: 'IDLE',
    WALKING: 'WALKING'
}

export default Player;