import EventDispatcher from "../helpers/event-dispatcher";
import LocalStore from "../store/localstore";

class OptionsManager {
    #localStorage;
    #config;
    #eventDispatcher;
    #events;

    constructor() {
        this.#localStorage = new LocalStore('sdm-options');
        const config = this.#localStorage.get();
        this.#config = config;
        this.#eventDispatcher = new EventDispatcher();
        this.#events = {
            CONFIG_CHANGE: 'CONFIG_CHANGE'
        }
    }

    get() {
        return this.#config;
    }

    updateConfig(config) {
        this.#config = config;

        this.#localStorage.set(config)

        this.#eventDispatcher.dispatch(this.#events.CONFIG_CHANGE, config);
    }

    onConfigChange(handler) {
        this.#eventDispatcher.registerHandler(this.#events.CONFIG_CHANGE, handler);
    }

    removeOnConfigChange(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.CONFIG_CHANGE, handler);
    }
}

export default OptionsManager;