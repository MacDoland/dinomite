import directions from "../helpers/direction";
import EventDispatcher from "../helpers/event-dispatcher";
import Grid from "../structures/grid";
import Timer from "../helpers/timer";
import Vector from "../structures/vector";
import InputManager, { InputKeys, InputSystem } from "./input-manager";
import AudioManager from "./audio-manager";
import Player, { PlayerState } from "../player";
import BombShop from "./bomb-shop";
import { indexToTileState, TileState } from "../state/tile-state";
import stateManager, { StateEvents } from "./state-manager";
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
    #bombShop;
    #player;
    #logger;
    #client;
    #players;
    #inputSystems;
    #bombs;
    #blasts;


    constructor(client, logger) {
        this.#client = client;
        this.#logger = logger;
        this.#timer = new Timer(true);
        this.#bombs = [];
        this.#blasts = [];

        const playerOneInputSystem = new InputSystem(123, controlConfig.playerOne);

        this.#inputSystems = [
            playerOneInputSystem
        ];

        this.#players = [];

        this.#inputManager = new InputManager();
        this.#audioManager = new AudioManager();
        this.#audioManager.load('boom', '../audio/boom.wav', 0.05, false);

        this.#eventDispatcher = new EventDispatcher();
        this.#events = {
            INIT: 'INIT',
            START: 'START',
            END: 'END',
            PAUSE: 'PAUSE',
            RESET: 'RESET',
            UPDATE: 'UPDATE',
            TICK: 'TICK',
        }
        Object.freeze(this.#events);

        const addPlayer = ({ id, state, position, direction }) => {
            const player = new Player(id, 'janedoe', 0, 48);
            if (player) {
                player.setPosition(position);
                player.setState(state);
                player.setDirection(direction);
            }

            if (!findById(this.#players, id)) {
                this.#players.push(player);
            }
        }

        this.#client.on(GameEvents.CONNECTED, ({ players, grid, bombs, blasts }) => {
            players.forEach(player => addPlayer(player));
            this.#grid = new Grid(15, 15, grid);

            if (bombs) {
                this.#bombs = bombs;
            }


        });

        this.#client.on(GameEvents.NEW_PLAYER, ({ id, state, position, direction }) => {
            const player = new Player(id, 'janedoe', 0, 48);
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
            console.log('receive');
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

        this.#client.send(GameEvents.NEW_PLAYER, { id: 123 });
        this.#client.send(GameEvents.NEW_PLAYER, { id: 456 });
    }

    /* Public methods */
    init() {
        this.#timer.stop();
        this.#timer.clearHandlers();;
        this.#timer.onElapsed(this.#update.bind(this));
        let input;
        let prev = 0;
        let deltaTime = 0;
        let now;

        //fast update loop
        const loop = () => {
            now = performance.now();
            deltaTime = (now - prev) / 1000;
            input = this.#inputManager.update();

            this.#eventDispatcher.dispatch(this.#events.UPDATE, {
                grid: this.#grid,
                players: this.#players,
                bombs: this.#bombs || [],
                blasts: this.#blasts || [],
                deltaTime
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
        this.#audioManager.stop('bg');
        this.#audioManager.play('cheering');
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
                console.log('send');
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

    onInit(handler) {
        this.#eventDispatcher.registerHandler(this.#events.INIT, handler);
    }

    removeOnInit(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.INIT, handler);
    }

    onEnd(handler) {
        this.#eventDispatcher.registerHandler(this.#events.END, handler);
    }

    removeOnEnd(handler) {
        this.#eventDispatcher.deregisterHandler(this.#events.END, handler);
    }
}

export default GameManager;