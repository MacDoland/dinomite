import EventDispatcher from "../helpers/event-dispatcher";

class InputManager {
    #eventDispatcher;
    #events;
    #keyState;
    #keys;

    constructor() {
        this.#eventDispatcher = new EventDispatcher();
        this.#events = {
            UP: 'UP',
            RIGHT: 'RIGHT',
            DOWN: 'DOWN',
            LEFT: 'LEFT',
            E: 'E',
            ANY: 'ANY'
        }

        this.#keyState = [];

        this.#keys = {
            KEY_UP: 38,
            KEY_DOWN: 40,
            KEY_LEFT: 37,
            KEY_RIGHT: 39,
            KEY_W: 87,
            KEY_A: 65,
            KEY_S: 83,
            KEY_D: 68

        }

        const keyEventLogger = (e) => {
            this.#keyState[e.keyCode] = e.type == 'keydown';
            this.#eventDispatcher.dispatch(this.#events.ANY)
        };
        window.addEventListener("keydown", keyEventLogger);
        window.addEventListener("keyup", keyEventLogger);
    }

    update() {
        if (this.#keyState[this.#keys.KEY_LEFT]) {
            this.#eventDispatcher.dispatch(this.#events.LEFT)
        }

        if (this.#keyState[this.#keys.KEY_UP]) {
            this.#eventDispatcher.dispatch(this.#events.UP)
        }

        if (this.#keyState[this.#keys.KEY_RIGHT]) {
            this.#eventDispatcher.dispatch(this.#events.RIGHT)
        }

        if (this.#keyState[this.#keys.KEY_DOWN]) {
            this.#eventDispatcher.dispatch(this.#events.DOWN)
        }

        return {
            UP: this.#keyState[this.#keys.KEY_UP] || this.#keyState[this.#keys.KEY_W],
            RIGHT: this.#keyState[this.#keys.KEY_RIGHT] || this.#keyState[this.#keys.KEY_D],
            DOWN: this.#keyState[this.#keys.KEY_DOWN] || this.#keyState[this.#keys.KEY_S],
            LEFT: this.#keyState[this.#keys.KEY_LEFT] || this.#keyState[this.#keys.KEY_A],
        }
    }

    onUp(handler) {
        this.#eventDispatcher.registerHandler(this.#events.UP, handler);
    }

    removeOnUp(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.UP, handler);
    }

    onRight(handler) {
        this.#eventDispatcher.registerHandler(this.#events.RIGHT, handler);
    }

    removeOnRight(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.RIGHT, handler);
    }

    onDown(handler) {
        this.#eventDispatcher.registerHandler(this.#events.DOWN, handler);
    }

    removeOnDown(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.DOWN, handler);
    }

    onLeft(handler) {
        this.#eventDispatcher.registerHandler(this.#events.LEFT, handler);
    }

    removeOnLeft(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.LEFT, handler);
    }

    onAnyKey(handler) {
        this.#eventDispatcher.registerHandler(this.#events.ANY, handler);
    }

    removeOnAnyKey(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.ANY, handler);
    }
}

export default InputManager;