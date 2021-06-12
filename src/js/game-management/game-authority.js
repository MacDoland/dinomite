import { GameEvents } from "../events/events";
import EventDispatcher from "../helpers/event-dispatcher";
import { processPlayerMovement } from "../helpers/referee";
import Vector from "../structures/vector";
import stateMachine, { StateEvents } from "./state-manager";

class GameAuthority {
    players;
    #grid;

    constructor(grid) {
        this.#grid = grid;
        this.players = {};
    }

    addPlayer(player) {
        this.players[player.getId()] = player;
    }

    processPlayerMovement(id, bounds, offset) {
        const newPosition = processPlayerMovement(this.#grid, bounds, offset);

        return {
            offset: newPosition,
            id
        }
    }
}

export default GameAuthority;

class LocalClient {
    #grid;
    #eventDispatcher;
    #events;
    #gameAuthority;
    #players;

    constructor(grid) {
        this.#gameAuthority = new GameAuthority(grid);
        this.#eventDispatcher = new EventDispatcher();
        this.#players = {};
        this.#events = {
            ON_RECEIVE_MESSAGE: 'ON_RECEIVE_MESSAGE'
        }
    }

    send(gameEvent, data) {
        switch (gameEvent) {
            case GameEvents.NEW_PLAYER:
                if (!this.#players[data.id]) {
                    this.#players[data.id] = {
                        id: data.id
                    }
                }
                break;
            case GameEvents.PLAYER_MOVE:
                const { id, offset} = this.#gameAuthority.processPlayerMovement(data.id, data.bounds, data.offset);

                if (offset.magnitude() > 0) {

                    const message = {
                        id,
                        offset
                    };

                    this.#eventDispatcher.dispatch(this.#events.ON_RECEIVE_MESSAGE, {
                        gameEvent,
                        message
                    });
                }
                break;
        }
    }

    onMessage(handler) {
        this.#eventDispatcher.registerHandler(this.#events.ON_RECEIVE_MESSAGE, handler);
    }
}

class NetworkClient {
    #eventDispatcher;
    #events;

    constructor(grid) {
        this.#eventDispatcher = new EventDispatcher();
        this.#events = {
            ON_RECEIVE_MESSAGE: 'ON_RECEIVE_MESSAGE'
        }
    }

    send(gameEvent, data) {

    }

    onReceiveMessage(handler) {
        this.#eventDispatcher.registerHandler(this.#events.ON_RECEIVE_MESSAGE, handler);
    }
}

export { LocalClient, NetworkClient };