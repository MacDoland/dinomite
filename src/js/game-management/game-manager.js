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
import { findById } from "../helpers/helpers";

class GameManager {
    #gameConfig;
    #grid;
    #timer;
    #moveDelay;
    #gameInProgess;
    #audioManager;
    #inputManager;
    #eventDispatcher;
    #events;
    #bombShop;
    #player;
    #currentGridIndex;
    #colliders;
    #logger;
    #client;
    #players;
    #inputSystems;


    constructor(client, gameConfig, grid, logger) {
        this.#client = client;
        this.#gameConfig = gameConfig;
        this.#logger = logger;
        this.#grid = grid;
        this.#timer = new Timer(true);
        this.#gameInProgess = false;
        this.#moveDelay = 150;

        const playerOneInputSystem = new InputSystem(123, controlConfig.playerOne);

        this.#inputSystems = [
            playerOneInputSystem
        ];

        this.#players = [];

        this.#bombShop = new BombShop();
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

        this.#colliders = [];

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

        this.#client.on(GameEvents.UPDATE, ({ players, tiles }) => {
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
        this.#gameInProgess = false;
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

            // this.#inputSystems.forEach((system) => {
            //     const input = system.update();
            //     const id = system.getId();
            //     this.#client.send(GameEvents.PLAYER_INPUT, { id, input: input.current });
            // });

            // let gridCoordinate = Vector.multiplyScalar(this.#player.getPosition(), 1 / 100).floor();
            // let gridIndex = this.#grid.getIndex(gridCoordinate.x, gridCoordinate.y);
            // this.#currentGridIndex = gridIndex;

            this.#logger.log('player count', this.#players.length);

            this.#eventDispatcher.dispatch(this.#events.UPDATE, {
                grid: this.#grid,
                players: this.#players,
                bombs: this.#bombShop.getActiveBombs() || [],
                blasts: this.#bombShop.getActiveBlasts() || [],
                colliders: this.#colliders,
                deltaTime
            });

            prev = now;

            requestAnimationFrame(loop);

        }

        this.#inputManager.onKeyDown(key => {
            // if (key === InputKeys.KEY_SPACE.toString()) {
            //     this.#bombShop.plant(this.#currentGridIndex);
            // }
        })

        this.#bombShop.onPlant(({ index }) => {
            const currentState = indexToTileState(this.#grid.getElementAt(index));
            const newState = parseInt(stateManager.transition(currentState.toString(), StateEvents.PLANT_BOMB).value);
            this.#grid.set(index, newState);
        });

        this.#bombShop.onBombExpired(({ index, strength }) => {
            const currentState = indexToTileState(this.#grid.getElementAt(index));
            const newState = parseInt(stateManager.transition(currentState.toString(), StateEvents.BOMB_DETONATE).value);
            this.#grid.set(index, newState);

            let neighbours = this.#grid.getNeighbours(index, strength);
            let targets = [];

            Object.keys(neighbours)
                .filter(key => [directions.UP, directions.RIGHT, directions.DOWN, directions.LEFT].includes(key))
                .map(key => neighbours[key]).map(tiles => {
                    targets = targets.concat(this.#getExplosionTargets(tiles));
                });

            this.#bombShop.createExplosion(index, 30, 800);

            targets.forEach((target) => {
                this.#bombShop.createExplosion(target, 30, 800);

                [this.#player].forEach(player => {
                    let playerGridPosition = Vector.multiplyScalar(player.getPosition(), 1 / 100).floor();
                    let playerIndex = Grid.convertCoordinateToIndex(playerGridPosition.x, playerGridPosition.y, this.#grid.getColumnCount(), this.#grid.getRowCount());
                    if (target === playerIndex) {
                        player.die();
                    }
                });
            });

        });

        this.#bombShop.onExplosion((index) => {
            this.#audioManager.play('boom');
            const currentState = indexToTileState(this.#grid.getElementAt(index));

            if (currentState === TileState.BOMB
                || currentState === TileState.BOMB_RUBBLE
                || currentState === TileState.BOMB_RUBBLE_SCORCH
                || currentState === TileState.BOMB_SCORCH) {
                //theres a bomb on this tile - detonate it
                setTimeout(() => {
                    this.#bombShop.detonateBombAt(index);
                }, 100);
            }

            const newState = parseInt(stateManager.transition(currentState.toString(), StateEvents.EXPLOSION).value);
            this.#grid.set(index, newState);
        });

        this.#bombShop.onExplosionEnd((index) => {
            console.log('onExplosionEnd');

            if (!this.#bombShop.hasActiveBlastAt(index)) {
                const currentState = indexToTileState(this.#grid.getElementAt(index));

                if (currentState >= 0) {
                    const newState = parseInt(stateManager.transition(currentState.toString(), StateEvents.EXPLOSION_END).value);
                    this.#grid.set(index, newState);
                }
            }
        });

        requestAnimationFrame(loop);
    }

    #processPlayerMovement(player, offset) {
        const canMoveTopRightX = this.#canMove(offset.getXOnly(), player.getTopRight(), this.#grid);
        const canMoveBottomRightX = this.#canMove(offset.getXOnly(), player.getBottomRight(), this.#grid);
        const canMoveTopLeftX = this.#canMove(offset.getXOnly(), player.getTopLeft(), this.#grid);
        const canMoveBottomLeftX = this.#canMove(offset.getXOnly(), player.getBottomLeft(), this.#grid);

        const canMoveTopRightY = this.#canMove(offset.getYOnly(), player.getTopRight(), this.#grid);
        const canMoveBottomRightY = this.#canMove(offset.getYOnly(), player.getBottomRight(), this.#grid);
        const canMoveTopLeftY = this.#canMove(offset.getYOnly(), player.getTopLeft(), this.#grid);
        const canMoveBottomLeftY = this.#canMove(offset.getYOnly(), player.getBottomLeft(), this.#grid);

        if (canMoveTopRightX && canMoveBottomRightX && canMoveTopLeftX && canMoveBottomLeftX) {
            player.move(offset.getXOnly());
        }

        if (canMoveTopRightY && canMoveBottomRightY && canMoveTopLeftY && canMoveBottomLeftY) {
            player.move(offset.getYOnly());
        }
    }

    #getExplosionTargets(tiles) {
        let targets = [];
        let hasHitDeadEnd = false;
        let index = 0;
        let targetIndex;

        if (tiles && Array.isArray(tiles)) {

            while (!hasHitDeadEnd && index < tiles.length) {
                targetIndex = tiles[index];
                hasHitDeadEnd = this.#grid.getElementAt(targetIndex) === TileState.INDESTRUCTIBLE || this.#grid.getElementAt(targetIndex) === TileState.OCEAN;
                if (!hasHitDeadEnd && this.#grid.getElementAt(targetIndex) !== TileState.INDESTRUCTIBLE) {
                    targets.push(targetIndex);
                }

                if (this.#grid.getElementAt(targetIndex) !== TileState.DESTRUCTABLE) {
                    index++;
                }
                else {
                    hasHitDeadEnd = true;
                }
            }
        }

        return targets;
    }

    start() {
        this.#gameInProgess = true;
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

            if (input.current.ACTION_UP) {
                console.log('action up', input.current.ACTION_UP)
            }

            const id = system.getId();
            this.#client.send(GameEvents.PLAYER_INPUT, { id, input: input.current });
        });
    }

    #canMove(offset, position, grid) {
        const potentialPosition = Vector.add(position, offset);
        let gridCoordinate = Vector.multiplyScalar(potentialPosition, 1 / 100).floor();
        let index = grid.getIndex(gridCoordinate.x, gridCoordinate.y);
        return index > 0 && index < grid.getGrid().length
            && (grid.getGrid()[index] === TileState.EMPTY
                || grid.getGrid()[index] === TileState.BOMB
                || grid.getGrid()[index] === TileState.RUBBLE
                || grid.getGrid()[index] === TileState.SCORCH
                || grid.getGrid()[index] === TileState.BOMB_RUBBLE_SCORCH
                || grid.getGrid()[index] === TileState.BOMB_SCORCH
                || grid.getGrid()[index] === TileState.BOMB_RUBBLE
                || grid.getGrid()[index] === TileState.RUBBLE_SCORCH
                || grid.getGrid()[index] === TileState.EXPLOSION
                || grid.getGrid()[index] === TileState.EXPLOSION_RUBBLE
                || grid.getGrid()[index] === TileState.EXPLOSION_SCORCH
                || grid.getGrid()[index] === TileState.EXPLOSION_RUBBLE_SCORCH
            );
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