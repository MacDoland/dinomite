import directions from "../helpers/direction";
import EventDispatcher from "../helpers/event-dispatcher";
import Grid from "../structures/grid";
import Timer from "../helpers/timer";
import Vector from "../structures/vector";
import InputManager, { InputKeys } from "./input-manager";
import AudioManager from "./audio-manager";
import Player from "../player";
import BombShop from "./bomb-shop";
import { indexToTileState, TileState } from "../state/tile-state";
import SinglyLinkedList from "../structures/linked-list";
import stateManager, { StateEvents } from "./state-manager";

class GameManager {
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

    constructor(grid) {
        this.#grid = grid;
        this.#timer = new Timer();
        this.#gameInProgess = false;
        this.#moveDelay = 150;

        this.#player = new Player();
        this.#player.move(new Vector(355, 355));
        this.#bombShop = new BombShop();

        this.#inputManager = new InputManager();
        // this.#inputManager.onUp(() => this.#snake.changeDirection(directions.UP));
        // this.#inputManager.onRight(() => this.#snake.changeDirection(directions.RIGHT));
        // this.#inputManager.onDown(() => this.#snake.changeDirection(directions.DOWN));
        // this.#inputManager.onLeft(() => this.#snake.changeDirection(directions.LEFT));

        this.#audioManager = new AudioManager();
        this.#audioManager.load('cheering', '../audio/cheering.wav', 0.3, false);

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
    }

    /* Public methods */
    init() {
        this.#gameInProgess = false;
        this.#timer.stop();
        this.#timer.clearHandlers();;
        this.#timer.onElapsed(this.#update.bind(this));
        let input;
        const speed = 400;
        let prev = 0;
        let deltaTime = 0;
        let now;
        let potentialPositionX;
        let potentialPositionY;
        let offset;
        // this.#audioManager.play('bg');

        const loop = () => {
            now = performance.now();
            deltaTime = (now - prev) / 1000;
            input = this.#inputManager.update();

            this.#player.update();

            let gridCoordinate = Vector.multiplyScalar(this.#player.getPosition(), 1 / 100).floor();
            let gridIndex = this.#grid.getIndex(gridCoordinate.x, gridCoordinate.y);
            this.#currentGridIndex = gridIndex;

            offset = new Vector(0, 0);

            if (input.DOWN) {
                offset.add(new Vector(0, speed * deltaTime));
            }

            if (input.RIGHT) {
                offset.add(new Vector(speed * deltaTime, 0))
            }

            if (input.UP) {
                offset.add(new Vector(0, -speed * deltaTime))
            }

            if (input.LEFT) {
                offset.add(new Vector(-speed * deltaTime, 0))
            }



            const canMoveTopRightX = this.#canMove(offset.getXOnly(), this.#player.getTopRight(), this.#grid);
            const canMoveBottomRightX = this.#canMove(offset.getXOnly(), this.#player.getBottomRight(), this.#grid);
            const canMoveTopLeftX = this.#canMove(offset.getXOnly(), this.#player.getTopLeft(), this.#grid);
            const canMoveBottomLeftX = this.#canMove(offset.getXOnly(), this.#player.getBottomLeft(), this.#grid);

            const canMoveTopRightY = this.#canMove(offset.getYOnly(), this.#player.getTopRight(), this.#grid);
            const canMoveBottomRightY = this.#canMove(offset.getYOnly(), this.#player.getBottomRight(), this.#grid);
            const canMoveTopLeftY = this.#canMove(offset.getYOnly(), this.#player.getTopLeft(), this.#grid);
            const canMoveBottomLeftY = this.#canMove(offset.getYOnly(), this.#player.getBottomLeft(), this.#grid);

            if (canMoveTopRightX && canMoveBottomRightX && canMoveTopLeftX && canMoveBottomLeftX) {
                this.#player.move(offset.getXOnly());
            }

            if (canMoveTopRightY && canMoveBottomRightY && canMoveTopLeftY && canMoveBottomLeftY) {
                this.#player.move(offset.getYOnly());
            }

            // if(this.#canMove(offset.getYOnly(), this.#player.getPosition(), this.#grid)){
            //     this.#player.move(offset.getYOnly());
            // }

            prev = now;

            this.#eventDispatcher.dispatch(this.#events.UPDATE, {
                grid: this.#grid,
                player: this.#player,
                direction: this.#player.getDirection(),
                playerState: this.#player.getState(),
                gridIndex,
                bombCount: this.#bombShop.getActiveBombs()
            });
            requestAnimationFrame(loop);
        }

        this.#inputManager.onKeyDown(key => {
            if (key === InputKeys.KEY_SPACE.toString()) {
                this.#bombShop.plant(this.#currentGridIndex);
            }
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
                    targets.push(this.#getExplosionTargets(tiles));
                });

            let bombTileTarget = new SinglyLinkedList();
            bombTileTarget.push(index);

            targets.unshift(bombTileTarget);

            this.#bombShop.createExplosion(index, targets, 200, 1000);
        });

        this.#bombShop.onExplosion((index) => {
            const currentState = indexToTileState(this.#grid.getElementAt(index));
            const newState = parseInt(stateManager.transition(currentState.toString(), StateEvents.EXPLOSION).value);
            this.#grid.set(index, newState);
        });

        this.#bombShop.onExplosionEnd((index) => {
            const currentState = indexToTileState(this.#grid.getElementAt(index));
            const newState = parseInt(stateManager.transition(currentState.toString(), StateEvents.EXPLOSION_END).value);
            this.#grid.set(index, newState);
        });

        requestAnimationFrame(loop);
    }

    #getExplosionTargets(tiles) {
        let targets = new SinglyLinkedList();
        let hasHitDeadEnd = false;
        let index = 0;
        let targetIndex;
        if (tiles && Array.isArray(tiles)) {

            while (!hasHitDeadEnd && index < tiles.length) {
                targetIndex = tiles[index];
                hasHitDeadEnd = this.#grid.getElementAt(targetIndex) === TileState.INDESTRUCTIBLE;
                if (!hasHitDeadEnd && this.#grid.getElementAt(targetIndex) !== TileState.INDESTRUCTIBLE) {
                    targets.push(targetIndex);
                }
                index++;
            }
        }

        return targets;
    }

    start() {
        this.#gameInProgess = true;
        this.#timer.start(this.#moveDelay);
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
        this.#inputManager.update();

        if (this.#gameInProgess) {
            this.#eventDispatcher.dispatch(this.#events.UPDATE, {
                grid: this.#grid,
                player: this.#player
            });
        }
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