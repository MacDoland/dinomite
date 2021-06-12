import EventDispatcher from "../helpers/event-dispatcher";
import { processPlayerMovement } from "../helpers/referee";
import Vector from "../structures/vector";
import stateMachine, { StateEvents } from "./state-manager";

class GameAuthority {
    messenger;
    players;
    #grid;

    constructor(grid) {
        this.#gridgrid = grid;
        this.messenger = messenger;
        this.players = {};
    }

    addPlayer(player) {
        this.players[player.getId()] = player;
    }

    processPlayerMovement(player, offset) {
        const newPosition = processPlayerMovement(this.#grid, player, offset);

        return {
            offset: newPosition,
            player
        }
    }
}

export default GameAuthority;

const GameEvents = {
    PLAYER_MOVE: 'PLAYER_MOVE'
}

class LocalClient {
    #eventDispatcher;
    #events;
    #gameAuthority;

    constructor(grid) {
        this.#gameAuthority = new GameAuthority(grid);
        this.#eventDispatcher = new EventDispatcher();
        this.#events = {
            ON_RECEIVE_MESSAGE: 'ON_RECEIVE_MESSAGE'
        }
    }

    send(gameEvent, data) {
        switch (gameEvent) {
            case GameEvents.PLAYER_MOVE:
                const response = this.#gameAuthority.processPlayerMovement(data.player, data.offset);
                this.#eventDispatcher.dispatch(this.#events.ON_RECEIVE_MESSAGE, response);
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