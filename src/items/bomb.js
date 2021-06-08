import EventDispatcher from '../helpers/event-dispatcher';
import Timer from "../helpers/timer";

class Bomb {
    #index;
    #timer;
    #strength;
    #isActive;
    #eventDispatcher;
    #events;
    #timeToExplode;

    constructor(index, strength, timeToExplode) {
        this.#index = index;
        this.#strength = strength;
        this.#timeToExplode = timeToExplode;
        this.#timer = new Timer();
        this.#isActive = false;

        this.#eventDispatcher = new EventDispatcher();
        this.#events = {
            EXPLODE: 'EXPLODE'
        }
    }

    getIndex() {
        return this.#index;
    }

    getIsActive() {
        return this.#isActive;
    }

    lightFuse() {
        this.#isActive = true;
        this.#timer.clearHandlers();
        this.#timer.start(this.#timeToExplode);

        this.#timer.onElapsed(() => {
            this.#isActive = false;

            this.#eventDispatcher.dispatch(this.#events.EXPLODE, {
                index: this.#index,
                strength: this.#strength
            });

        });
    }

    move(index) {
        this.#index = index;
    }

    reset(){
         this.#index = -1;
    }

    clearHandlers() {
        this.#eventDispatcher.reset();
    }

    onExplode(handler) {
        this.#eventDispatcher.registerHandler(this.#events.EXPLODE, handler);
    }

    removeOnExplode(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.EXPLODE, handler);
    }
}

export default Bomb;