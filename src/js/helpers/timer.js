import EventDispatcher from './event-dispatcher';

class Timer {
    #elaspsed;
    #startTime;
    #current;
    #target;
    #isActive;
    #eventDispatcher;
    #events;
    #previousTick;
    #deltaTime;
    #isLoop;

    constructor(isLoop) {
        this.#isLoop = isLoop;
        this.#eventDispatcher = new EventDispatcher();
        this.#events = {
            TICK: "TICK",
            ELAPSED: "ELAPSED"
        }
        this.#previousTick = 0;
    }

    start(target) {
        this.#current = 0;
        this.#startTime = new Date();
        this.#target = target;
        this.#isActive = true;

        setTimeout(this.#timerLoop.bind(this), 0);
    }

    reset() {
        this.#current = 0;
        this.#startTime = new Date();
    }

    stop() {
        this.#isActive = false;
    }

    finish() {
        this.#current = this.#target;
    }

    hasElapsed() {
        return this.#elaspsed;
    }

    getRemainingTime() {
        return this.#target - this.#current;
    }



    tick() {
        if (this.#isActive) {
            this.#deltaTime = (new Date() - this.#previousTick) / 1000;
            this.#previousTick = new Date();
            this.#eventDispatcher.dispatch(this.#events.TICK, this.#deltaTime);
            this.#current = new Date() - this.#startTime;
            this.#elaspsed = this.#current > this.#target;

            if (this.hasElapsed()) {
                this.#eventDispatcher.dispatch(this.#events.ELAPSED);

                if (this.#isLoop) {
                    this.reset();
                }
                else {
                    this.#isActive = false;
                }
            }
        }
    }

    #timerLoop() {
        this.tick();

        if (this.#isActive) {
            setTimeout(this.#timerLoop.bind(this), 0);
        }
    }

    clearHandlers() {
        this.#eventDispatcher.reset();
    }

    /* Events */
    onTick(handler) {
        this.#eventDispatcher.registerHandler(this.#events.TICK, handler);
    }

    removeOnTick(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.TICK, handler);
    }

    onElapsed(handler) {
        this.#eventDispatcher.registerHandler(this.#events.ELAPSED, handler);
    }

    removeOnElapsed(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.ELAPSED, handler);
    }

}

export default Timer;