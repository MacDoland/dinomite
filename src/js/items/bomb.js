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
    #state;
    #ownerId;

    constructor(ownerId, index, strength, timeToExplode) {
        this.#ownerId = ownerId;
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

    assignOwner(id){
        this.#ownerId = id;
    }

    getOwnerId(){
        return this.#ownerId;
    }

    getIndex() {
        return this.#index;
    }

    getIsActive() {
        return this.#isActive;
    }

    getTimerDuration() {
        return this.#timeToExplode;
    }

    getTimeToDetonation() {
        return this.#timer.getRemainingTime();
    }

    getState() {
        if(!this.#isActive){
            return BombState.INACTIVE;
        }
        else{
            return  this.#timer.getRemainingTime() < (this.#timeToExplode / 2) ? BombState.NEAR_DETONATION : BombState.ACTIVE;
        }
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

    detonate() {
        this.#timer.finish();
        this.#eventDispatcher.dispatch(this.#events.EXPLODE, {
            index: this.#index,
            strength: this.#strength
        });
    }

    move(index) {
        this.#index = index;
    }

    reset() {
        this.#index = -1;
    }

    getProgress() {
        return (1 -(this.#timer.getRemainingTime() / this.#timeToExplode)) * 100
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

const BombState = {
    ACTIVE: 0,
    NEAR_DETONATION: 1,
    INACTIVE: 3
}

export default Bomb;
export { BombState };