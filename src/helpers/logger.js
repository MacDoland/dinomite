class Logger {

    #logs;

    constructor(){
        this.#logs = [];
    }

    retrieveLogs() {
        const logs = this.#logs;
        this.#logs = [];
        return logs;
    }

    log(name, data) {
        this.#logs.push({name, data});
    }
}

export default Logger;