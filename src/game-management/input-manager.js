import EventDispatcher from "../helpers/event-dispatcher";

class InputManager {
    #eventDispatcher;
    #events;
    #keyState;
    #previousKeyState;
    #keys;

    constructor() {
        this.#eventDispatcher = new EventDispatcher();
        this.#events = {
            UP_HELD: 'UP',
            RIGHT_HELD: 'RIGHT',
            DOWN_HELD: 'DOWN',
            LEFT_HELD: 'LEFT',
            E_HELD: 'E',
            SPACE_HELD: 'SPACE',
            ANY_HELD: 'ANY',
            ONKEYUP: 'ONKEYUP',
            ONKEYDOWN: 'ONKEYDOWN'
        }

        this.#keyState = [];
        this.#previousKeyState = [];


        const keyEventLogger = (e) => {
            this.#keyState[e.keyCode] = e.type == 'keydown';
            this.#eventDispatcher.dispatch(this.#events.ANY)
        };
        window.addEventListener("keydown", keyEventLogger);
        window.addEventListener("keyup", keyEventLogger);
    }

    update() {

        Object.keys(this.#keyState).forEach(key => {
            if (!this.#keyState[key] && this.#previousKeyState[key]) {
                this.#eventDispatcher.dispatch(this.#events.ONKEYUP, key);
            }

            if (this.#keyState[key] && !this.#previousKeyState[key]) {
                this.#eventDispatcher.dispatch(this.#events.ONKEYDOWN, key);
            }
        });

        this.#previousKeyState = [...this.#keyState];

        return {
            UP: this.#keyState[InputKeys.KEY_UP] || this.#keyState[InputKeys.KEY_W],
            RIGHT: this.#keyState[InputKeys.KEY_RIGHT] || this.#keyState[InputKeys.KEY_D],
            DOWN: this.#keyState[InputKeys.KEY_DOWN] || this.#keyState[InputKeys.KEY_S],
            LEFT: this.#keyState[InputKeys.KEY_LEFT] || this.#keyState[InputKeys.KEY_A],
            SPACE: this.#keyState[InputKeys.KEY_SPACE]
        }

    }

    onKeyUp(handler) {
        this.#eventDispatcher.registerHandler(this.#events.ONKEYUP, handler);
    }

    removeOnKeyUp(handler) {
        this.#eventDispatcher.registerHandler(this.#events.ONKEYUP, handler);
    }

    onKeyDown(handler) {
        this.#eventDispatcher.registerHandler(this.#events.ONKEYDOWN, handler);
    }

    removeOnKeyDown(handler) {
        this.#eventDispatcher.registerHandler(this.#events.ONKEYDOWN, handler);
    }

}

export default InputManager;

export const InputKeys = {
    KEY_UP: 38,
    KEY_DOWN: 40,
    KEY_LEFT: 37,
    KEY_RIGHT: 39,
    KEY_W: 87,
    KEY_A: 65,
    KEY_S: 83,
    KEY_D: 68,
    KEY_SPACE: 32
}