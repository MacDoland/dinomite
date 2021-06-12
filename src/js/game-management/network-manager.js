import { io } from 'socket.io-client';


class NetworkManager {
    #socket
    constructor() {
        this.#socket = io("ws://localhost:3000", {
            withCredentials: true,
            extraHeaders: {}
        });



        this.#socket.on("connect", () => {
            // either with send()
            this.#socket.send("Hello!");

            // or with emit() and custom event names
            this.#socket.emit("salutations", "Hello!", { "mr": "john" }, Uint8Array.from([1, 2, 3, 4]));
        });

        // handle the event sent with socket.send()
        this.#socket.on("message", data => {
            console.log(data);
        });

        // handle the event sent with socket.emit()
        this.#socket.on("greetings", (elem1, elem2, elem3) => {
            console.log(elem1, elem2, elem3);
        });
    }

    send(data) {

    }

}

