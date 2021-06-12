class AudioManager {
    #tracks;

    constructor(){
        this.#tracks = [];
    }

    load(key, path, volume = 0.5, loop = false) {
        this.#tracks[key] = new Audio(path);
        this.#tracks[key].volume = volume;
        this.#tracks[key].loop = loop;
    }

    play(key) {
        this.#tracks[key].currentTime = 0;
        this.#tracks[key].play();
    }

    stop(key) {
        this.#tracks[key].currentTime = 0;
        this.#tracks[key].pause();
    }
}

export default AudioManager;