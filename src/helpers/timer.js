import EventDispatcher from './event-dispatcher';

class Timer {
    #elaspsed;
    #startTime;
    #current;
    #target;
    #isActive;
    #eventDispatcher;
    #events;

    constructor(){
        this.#eventDispatcher = new EventDispatcher();
        this.#events = {
            TICK: "TICK",
            ELAPSED: "ELAPSED"
        }
    }

    start(target) {
        this.#current = 0;
        this.#startTime = performance.now();
        this.#target = target;
        this.#isActive = true;
        
        window.requestAnimationFrame(this.#timerLoop.bind(this));
    }

    reset() {
        this.#current = 0;
        this.#startTime = performance.now();
    }

    stop() {
        this.#isActive = false;
    }

    hasElapsed() {
        return this.#elaspsed;
    }

    tick() {
        if (this.#isActive) {
            this.#eventDispatcher.dispatch(this.#events.TICK, this.#current / this.#target );
            this.#current = performance.now() - this.#startTime;
            this.#elaspsed = this.#current > this.#target;

            if (this.hasElapsed()) {
                this.#eventDispatcher.dispatch(this.#events.ELAPSED);
                this.reset();
            }
        }
    }

    #timerLoop() {
        this.tick();

        if (this.#isActive) {
            setTimeout(this.#timerLoop.bind(this),0);
        }
    }

    clearHandlers(){
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