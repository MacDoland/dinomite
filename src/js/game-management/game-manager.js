import EventDispatcher from "../helpers/event-dispatcher";
import Grid from "../structures/grid";
import Timer from "../helpers/timer";
import InputManager, { InputKeys, InputSystem } from "./input-manager";
import AudioManager from "./audio-manager";
import Player from "../player";
import controlConfig from '../config/controls';
import { GameEvents } from "../events/events";
import { findById, objectPropertiesAreFalse } from "../helpers/helpers";

class GameManager {
    #grid;
    #timer;
    #audioManager;
    #inputManager;
    #eventDispatcher;
    #events;
    #player;
    #client;
    #players;
    #inputSystems;
    #bombs;
    #blasts;
    #playerId;

    constructor(client) {
        this.#client = client;
        this.#timer = new Timer(true);
        this.#bombs = [];
        this.#blasts = [];
        this.#players = [];
        this.#playerId = null;

        const playerOneInputSystem = new InputSystem("123", controlConfig.playerOne);
        const playerTwoInputSystem = new InputSystem("456", controlConfig.playerTwo);

        this.#inputSystems = [
            playerOneInputSystem,
            playerTwoInputSystem
        ];

        this.#inputManager = new InputManager();
        this.#audioManager = new AudioManager();
        this.#audioManager.load('boom', '../audio/boom.wav', 0.05, false);

        this.#eventDispatcher = new EventDispatcher();
        this.#events = {
            UPDATE: 'UPDATE',
            END: 'END'
        }
        Object.freeze(this.#events);

        const addPlayer = ({ id, state, position, direction, characterId }, playerId) => {
            const player = new Player(playerId, characterId, 48);

            if (player) {
                player.setPosition(position);
                player.setState(state);
                player.setDirection(direction);
            }

            if (!findById(this.#players, playerId)) {
                this.#players.push(player);
            }
        }

        this.#client.on(GameEvents.CONNECTED, ({ players, grid, bombs, blasts, playerId }) => {
            players.forEach(player => addPlayer(player, player.id));
            this.#grid = new Grid(15, 15, grid);

            if (bombs) {
                this.#bombs = bombs;
            }

            if (blasts) {
                this.#blasts = bombs;
            }

            this.#playerId = playerId;
        });

        this.#client.on(GameEvents.NEW_PLAYER, ({ id, cId: characterId, s: state, p: position, d: direction }) => {
            const player = new Player(id, characterId, 48);

            if (player) {
                player.setPosition(position);
                player.setState(state);
                player.setDirection(direction);
            }

            if (!findById(this.#players, id)) {
                this.#players.push(player);
            }
        });


        this.#client.on(GameEvents.PLAYER_LEFT, ({ id }) => {
            this.#players = this.#players.filter(player => player.getId() !== id)
        });

        this.#client.on(GameEvents.PLAYER_SET_POSITION, ({ id, state, position, direction }) => {
            const player = findById(this.#players, id);

            if (player) {
                player.setPosition(position);
                player.setState(state);
                player.setDirection(direction);
            }
        });

        this.#client.on(GameEvents.UPDATE, ({ players, tiles, bombs, blasts }) => {
            players.forEach(({ id, position, state, direction }) => {
                let player = findById(this.#players, id);

                if (!player) {
                    player = new Player(id, 'janedoe', 0, 48);
                    this.#players.push(player);
                }

                if (player) {
                    player.setPosition(position);
                    player.setState(state);
                    player.setDirection(direction);
                }

                if (bombs) {
                    this.#bombs = bombs;
                }

                if (blasts) {
                    this.#blasts = blasts;
                }
            });

            if (Array.isArray(tiles)) {
                tiles.forEach((tileUpdate) => {
                    this.#grid.set(tileUpdate.index, tileUpdate.value, false);
                });
            }
        });

        let characterId = window.localStorage.getItem('dinomiteCharacterId') || 0
        this.#client.send(GameEvents.NEW_PLAYER, { id: "123", cId: characterId });

        this.#client.send(GameEvents.NEW_PLAYER, { id: "456", cId: 1 });
    }

    /* Public methods */
    init() {
        this.#timer.stop();
        this.#timer.clearHandlers();;
        this.#timer.onElapsed(this.#update.bind(this));
        let prev = 0;
        let deltaTime = 0;
        let now;
        let input;

        //render / update loop
        const loop = () => {
            now = performance.now();
            deltaTime = (now - prev) / 1000;
            input = this.#inputManager.update();

            this.#eventDispatcher.dispatch(this.#events.UPDATE, {
                grid: this.#grid,
                bombs: this.#bombs || [],
                blasts: this.#blasts || [],
                deltaTime,
                players: this.#players,
                playerId: this.#playerId
            });

            prev = now;

            requestAnimationFrame(loop);
        }

        requestAnimationFrame(loop);
    }

    start() {
        this.#timer.start(1000 / 60);
    }

    end() {
        this.#timer.stop();
        this.#timer.removeOnElapsed(this.#update);
        // this.#audioManager.stop('bg');
        // this.#audioManager.play('cheering');
        this.#eventDispatcher.dispatch(this.#events.END,
            {
                grid: this.#grid,
                player: this.#player
            });
    }

    /* Private Methods */
    #update() {
        this.#inputSystems.forEach((system) => {
            const input = system.update();

            if (input && (!objectPropertiesAreFalse(input.previous) || !objectPropertiesAreFalse(input.current))) {
                const id = system.getId();
                this.#client.send(GameEvents.PLAYER_INPUT, { id, input: input.current });
            }
        });
    }

    /* Events */
    onUpdate(handler) {
        this.#eventDispatcher.registerHandler(this.#events.UPDATE, handler);
    }

    removeOnUpdate(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.UPDATE, handler);
    }

}

export default GameManager;