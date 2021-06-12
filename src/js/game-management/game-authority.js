import { GameEvents } from "../events/events";
import EventDispatcher from "../helpers/event-dispatcher";
import { findById } from "../helpers/helpers";
import { processPlayerMovement } from "../helpers/referee";
import Player from "../player";
import Vector from "../structures/vector";
import stateMachine, { StateEvents } from "./state-manager";

class GameAuthority {
    players;
    #grid;
    #deltaTime;
    #gameConfig;

    constructor(grid, gameConfig) {
        this.#grid = grid;
        this.#gameConfig = gameConfig;
        this.players = {};
        this.inputs = [];
        let prev = 0;
        this.#deltaTime = 0;
        let now;
        let player;
        let speed = 400;

        const loop = () => {
            now = performance.now();
            this.#deltaTime = (now - prev) / 1000;
            prev = now;
            requestAnimationFrame(loop);
        }

        requestAnimationFrame(loop);
    }

    addPlayer(id) {
        this.players[id] = new Player(id, 'name', 0, 48, null, null);
        this.players[id].setPosition(this.#grid.getCellCenter(this.#gameConfig.startPlayerOne, this.#gameConfig.cellSize));
    }

    processPlayerInput(id, input) {
        const player = this.players[id];
        const speed = 400;
        let offset = new Vector(0, 0);

        if (input.DOWN) {
            offset.add(new Vector(0, speed * this.#deltaTime));
        }

        if (input.RIGHT) {
            offset.add(new Vector(speed * this.#deltaTime, 0))
        }

        if (input.UP) {
            offset.add(new Vector(0, -speed * this.#deltaTime))
        }

        if (input.LEFT) {
            offset.add(new Vector(-speed * this.#deltaTime, 0))
        }

        const result = this.processPlayerMovement(id, player.getBounds(), offset);

        this.players[id].move(result.offset);

        return { id, position: this.players[id].getPosition(), state: this.players[id].getState() };
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

    constructor(grid, gameConfig) {
        this.#gameAuthority = new GameAuthority(grid, gameConfig);
        this.#eventDispatcher = new EventDispatcher();
        this.#events = {
            ON_RECEIVE_MESSAGE: 'ON_RECEIVE_MESSAGE'
        }
    }

    send(gameEvent, data) {
        let result;
        switch (gameEvent) {
            case GameEvents.NEW_PLAYER:
                this.#gameAuthority.addPlayer(data.id);
                break;
            case GameEvents.PLAYER_INPUT:
                result = this.#gameAuthority.processPlayerInput(data.id, data.input);
                if (result.position.magnitude() > 0) {

                    const message = {
                        id: result.id,
                        position: result.position,
                        state: result.state
                    };

                    this.#eventDispatcher.dispatch(this.#events.ON_RECEIVE_MESSAGE, {
                        gameEvent: GameEvents.PLAYER_SET_POSITION,
                        message
                    });
                }
                break;

            case GameEvents.PLAYER_MOVE:
                result = this.#gameAuthority.processPlayerMovement(data.id, data.bounds, data.offset);

                if (result.offset.magnitude() > 0) {

                    const message = {
                        id: result.id,
                        offset: result.offset
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