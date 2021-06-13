import { GameEvents } from "../events/events";
import EventDispatcher from "../helpers/event-dispatcher";
import { findById } from "../helpers/helpers";
import { processPlayerMovement } from "../helpers/referee";
import Player from "../player";
import Vector from "../structures/vector";
import stateMachine, { StateEvents } from "./state-manager";
import { io } from 'socket.io-client';
import Timer from "../helpers/timer";

class GameAuthority {
    players;
    #grid;
    #deltaTime;
    #gameConfig;
    #timer;

    #playerMovementUpdates;

    constructor(grid, gameConfig) {
        this.#timer = new Timer(true);
        this.#grid = grid;
        this.#gameConfig = gameConfig;
        this.players = {};
        this.inputs = [];
        let prev = 0;
        this.#deltaTime = 0;
        let now;
        let player;
        let speed = 400;
        this.#playerMovementUpdates = {};

        const loop = () => {
            now = new Date();
            this.#deltaTime = (now - prev) / 1000;


            Object.keys(this.#playerMovementUpdates).forEach(key => {
                if (this.#playerMovementUpdates[key]) {
                    const input = this.#playerMovementUpdates[key];

                    if (input) {
                        this.processPlayerInput(key, input);
                        this.#playerMovementUpdates[key] = null;
                    }
                }
            })

            prev = now;
        }

        this.#timer.onElapsed(loop);
        this.#timer.start(1000 / 60)

        setTimeout(loop, 0);
    }

    addPlayer(id) {
        if (!this.players[id]) {
            this.players[id] = new Player(id, 'name', 0, 48);
            let startIndex = Object.keys(this.players).length === 1 ? this.#gameConfig.startPlayerOne : this.#gameConfig.startPlayerTwo;
            this.players[id].setPosition(this.#grid.getCellCenter(startIndex, this.#gameConfig.cellSize));
        }

        return this.players[id];
    }

    removePlayer(id) {
        if (this.players[id]) {
            this.players[id] = null;
        }
    }

    getUpdate() {
        return {
            players: Object.keys(this.players).filter(key => this.players[key]).map((key) => {
                const player = this.players[key];
                return {
                    id: player.getId(),
                    position: player.getPosition().raw(),
                    state: player.getState(),
                    direction: player.getDirection()
                }
            })
        }
    }

    addPlayerInputUpdate(id, input) {
        this.#playerMovementUpdates[id] = input;
    }

    processPlayerInput(id, input) {
        const player = this.players[id];

        if (player) {
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

            return {
                id,
                position: this.players[id].getPosition(),
                state: this.players[id].getState(),
                direction: this.players[id].getDirection()
            };
        }
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

        const loop = () => {
            let message = this.#gameAuthority.getUpdate();
            this.#eventDispatcher.dispatch(GameEvents.UPDATE, {
                ...message
            });
            setTimeout(loop, 1000 / 60);
        }

        setTimeout(loop, 1000 / 60);

    }

    send(gameEvent, data) {
        let result;
        switch (gameEvent) {
            case GameEvents.NEW_PLAYER:
                let response = this.#gameAuthority.addPlayer(data.id);
                this.#eventDispatcher.dispatch(GameEvents.NEW_PLAYER, {
                    id: response.getId(),
                    state: response.getState(),
                    position: response.getPosition(),
                    direction: response.getDirection()
                });
                break;
            case GameEvents.PLAYER_INPUT:
                result = this.#gameAuthority.addPlayerInputUpdate(data.id, data.input);
                break;
        }
    }

    on(event, handler) {
        this.#eventDispatcher.registerHandler(event, handler);
    }
}

class NetworkClient {
    #eventDispatcher;
    #events;
    #socket

    constructor() {
        this.#socket = io("ws://localhost:3000", {
            withCredentials: true,
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

export { LocalClient, NetworkClient };