class LocalStore {
    #key;
    #data;
    constructor(key) {
        this.#key = key;

        const dataString = window.localStorage.getItem(this.#key);

        if (typeof (this.#data) === 'string') {
            this.#data = JSON.parse(dataString);
        }
    }

    get() {
        return this.#data;
    }

    set(entry) {
        this.#data = entry;
        window.localStorage.setItem(this.#key, JSON.stringify(entry));
    }
}

export default LocalStore;