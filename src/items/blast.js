import EventDispatcher from "../helpers/event-dispatcher";
import Timer from "../helpers/timer";

class Blast {
    #isActive;
    #index
    #blastTargets;
    #blastAreas;
    #rateOfFire;
    #duration;
    #eventDispatcher;
    #events;
    #durationTimer;

    constructor(index, rateOfFire, duration = 1000) {
        this.#index = index;
        this.#isActive = false;
        // this.#blastTargets = blastTargets;
        this.#blastAreas = [];
        this.#rateOfFire = rateOfFire;
        this.#duration = duration;
        this.#durationTimer = new Timer();
        this.#eventDispatcher = new EventDispatcher();
        this.#events = {
            TICK: 'TICK',
            EXPLODE: 'EXPLODE',
            END: 'END'
        };
        Object.freeze(this.#events);

        this.#durationTimer.onElapsed(() => {
            this.#isActive = false;
            this.#eventDispatcher.dispatch(this.#events.END, this.#index);
        });
    }


    getIndex() {
        return this.#index;
    }

    getIsActive() {
        return this.#isActive;
    }

    getTimerDuration() {
        return this.#duration;
    }

    getRemainingTime() {
        return this.#durationTimer.getRemainingTime();
    }

    detonate(index) {
        this.#blastAreas = [];
        this.#blastAreas.push(index);
        this.#index = index;

        if (!this.#isActive) {
            this.#isActive = true;
            this.#durationTimer.reset();
            this.#durationTimer.start(this.#duration);

            console.log("BOMB about to explode");
            this.#eventDispatcher.dispatch(this.#events.EXPLODE, this.#blastAreas);
        }
    }

    onExplode(handler) {
        this.#eventDispatcher.registerHandler(this.#events.EXPLODE, handler);
    }

    removeOnExplode(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.EXPLODE, handler);
    }

    onEnd(handler) {
        this.#eventDispatcher.registerHandler(this.#events.END, handler);
    }

    removeOnEnd(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.END, handler);
    }

    onTick(handler) {
        this.#eventDispatcher.registerHandler(this.#events.TICK, handler);
    }

    removeOnTick(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.TICK, handler);
    }
}

export default Blast;