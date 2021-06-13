import { io } from 'socket.io-client';
import { GameEvents } from '../events/events';
import EventDispatcher from '../helpers/event-dispatcher';

class NetworkClient {
    #eventDispatcher;
    #events;
    #socket

    constructor() {
        //this.#socket = io("ws://localhost:3000", {
        this.#socket = io('ws://192.248.152.139:3000', {
            withCredentials: false,
            extraHeaders: {}
        });
        this.#eventDispatcher = new EventDispatcher();
        this.#events = {
            ON_RECEIVE_MESSAGE: 'ON_RECEIVE_MESSAGE',
            ON_CONNECTED: 'ON_CONNECTED'
        }

        this.#socket.on("connect", () => {

        });

        Object.keys(GameEvents).map(key => {
            this.#socket.on(GameEvents[key], data => {
                this.#eventDispatcher.dispatch(GameEvents[key], data);
            });
        })
    }

    send(gameEvent, data) {
        this.#socket.emit(gameEvent, data);
    }

    on(event, handler) {
        this.#eventDispatcher.registerHandler(event, handler);
    }

    onConnected(handler) {
        this.#eventDispatcher.registerHandler(this.#events.ON_CONNECTED, handler);
    }
}

export { NetworkClient };