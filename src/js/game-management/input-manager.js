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
            ONKEYDOWN: 'ONKEYDOWN',
            ONKEYPRESS: 'ONKEYPRESS'
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

            if (this.#keyState[key] && this.#previousKeyState[key]) {
                this.#eventDispatcher.dispatch(this.#events.ONKEYPRESS, key);
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

    getKeyPressed(key) {
        return this.#keyState[key];
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

    onKeyPress(handler) {
        this.#eventDispatcher.registerHandler(this.#events.ONKEYPRESS, handler);
    }

    removeOnKeyPress(handler) {
        this.#eventDispatcher.registerHandler(this.#events.ONKEYPRESS, handler);
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
    KEY_SPACE: 32,
    KEY_G: 71,
    KEY_NUM0: 96
}

class InputSystem {
    #eventDispatcher;
    #events;
    #inputManager;
    #upKeyCode;
    #rightKeyCode;
    #downKeyCode;
    #leftKeyCode;
    #actionKeyCode;
    #id;
    #previousInput;
    #currentInput;

    constructor(id, { upKeyCode, rightKeyCode, downKeyCode, leftKeyCode, actionKeyCode }) {
        this.#id = id;
        this.#inputManager = new InputManager();
        this.#eventDispatcher = new EventDispatcher();
        this.#events = {
            ON_UP_KEY_PRESS: 'ON_UP_KEY_PRESS',
            ON_RIGHT_KEY_PRESS: 'ON_RIGHT_KEY_PRESS',
            ON_DOWN_KEY_PRESS: 'ON_DOWN_KEY_PRESS',
            ON_LEFT_KEY_PRESS: 'ON_LEFT_KEY_PRESS',
            ON_ACTION_KEY_UP: 'ON_ACTION_KEY_UP'
        }

        this.#upKeyCode = upKeyCode;
        this.#rightKeyCode = rightKeyCode;
        this.#downKeyCode = downKeyCode;
        this.#leftKeyCode = leftKeyCode;
        this.#actionKeyCode = actionKeyCode;

        this.#previousInput = {
            UP: false,
            RIGHT: false,
            DOWN: false,
            LEFT: false
        }

        this.#currentInput = this.#previousInput;

        // this.#inputManager.onKeyDown(this.processKeyPress)
        // this.#inputManager.onKeyPress(this.processKeyPress);
    }

    getId() {
        return this.#id;
    }

    update() {
        this.#inputManager.update();
        this.#previousInput = this.#currentInput;
        this.#currentInput = {
            UP: this.#inputManager.getKeyPressed(this.#upKeyCode),
            RIGHT: this.#inputManager.getKeyPressed(this.#rightKeyCode),
            DOWN: this.#inputManager.getKeyPressed(this.#downKeyCode),
            LEFT: this.#inputManager.getKeyPressed(this.#leftKeyCode),
        }

        return {
           previous: this.#previousInput,
           current: this.#currentInput
        }
    }

    hasChanged(){
        return this.#currentInput.UP !== this.#previousInput.UP
        || this.#currentInput.DOWN !== this.#previousInput.DOWN
        || this.#currentInput.LEFT !== this.#previousInput.LEFT
        || this.#currentInput.RIGHT !== this.#previousInput.RIGHT
    }

    processKeyPress(key) {
        if (key === this.#upKeyCode) {
            this.#eventDispatcher.dispatch(this.#events.ON_UP_KEY_PRESS);
        }

        if (key === this.#rightKeyCode) {
            this.#eventDispatcher.dispatch(this.#events.ON_RIGHT_KEY_PRESS);
        }

        if (key === this.#leftKeyCode) {
            this.#eventDispatcher.dispatch(this.#events.ON_LEFT_KEY_PRESS);
        }

        if (key === this.#downKeyCode) {
            this.#eventDispatcher.dispatch(this.#events.ON_DOWN_KEY_PRESS);
        }
    }

    processKeyUp(key) {
        if (key === this.#actionKeyCode) {
            this.#eventDispatcher.dispatch(this.#events.ON_ACTION_KEY_UP);
        }
    }

    onUpKeyPress(handler) {
        this.#eventDispatcher.registerHandler(this.#events.ON_UP_KEY_PRESS, handler);
    }

    onRightKeyPress(handler) {
        this.#eventDispatcher.registerHandler(this.#events.ON_RIGHT_KEY_PRESS, handler);
    }

    onDownKeyPress(handler) {
        this.#eventDispatcher.registerHandler(this.#events.ON_DOWN_KEY_PRESS, handler);
    }

    onLeftKeyPress(handler) {
        this.#eventDispatcher.registerHandler(this.#events.ON_LEFT_KEY_PRESS, handler);
    }

    onActionKeyUp(handler) {
        this.#eventDispatcher.registerHandler(this.#events.ON_ACTION_KEY_UP, handler);
    }
}

export { InputSystem };