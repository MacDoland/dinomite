class LocalStore {
    #data;
    #key;
    constructor(key) {
        this.#key = key;
        this.#data = [];
        let dataString = window.localStorage.getItem(key);

        if (typeof (dataString) === 'string') {
            let data = JSON.parse(dataString);

            if (Array.isArray(data)) {
                this.#data = [...data];
            }
        }
    }

    get() {
        return this.#data;
    }

    set(entry) {
        this.#data.push(entry);
        window.localStorage.setItem(this.#key, JSON.stringify(this.#data));
    }
}

export default LocalStore;