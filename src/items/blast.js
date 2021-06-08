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

    constructor(index, blastTargets, rateOfFire, duration = 1000) {
        this.#index = index;
        this.#isActive = false;
        this.#blastTargets = blastTargets;
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
           this.#eventDispatcher.dispatch(this.#events.END);
        });
    }

    getIsActive(){
        return this.#isActive;
    }

    detonate(index) {
        this.#blastAreas = [];
        this.#blastAreas.push(index);
        this.#index = index;

        if(!this.#isActive) {
            this.#isActive = true;
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

    onTick(handler) {
        this.#eventDispatcher.registerHandler(this.#events.TICK, handler);
    }

    removeOnTick(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.TICK, handler);
    }
}

export default Blast;