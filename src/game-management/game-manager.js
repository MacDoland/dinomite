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
import Rectangle from "../structures/rectangle";
import { resolveCollisions } from "../helpers/collisions";

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
    #colliders;
    #logger;


    constructor(grid, logger) {
        this.#logger = logger;
        this.#grid = grid;
        this.#timer = new Timer();
        this.#gameInProgess = false;
        this.#moveDelay = 150;

        this.#player = new Player();
        this.#player.move(new Vector(355, 355));
        this.#bombShop = new BombShop();
        this.#inputManager = new InputManager();
        this.#audioManager = new AudioManager();
        this.#audioManager.load('boom', '../audio/boom.wav', 0.3, false);

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


            let offsetRight, offsetLeft, offsetUp, offsetDown;
            let collider = this.#player.getGlobalBoundingBox().clone();
            let playerTileCoordinate = Grid.convertIndexToCoordinate(gridIndex, 15, 15).multiplyScalar(100);
            let neighbours = this.#grid.getNeighbours(gridIndex);


            offsetRight = collider.getRight() - playerTileCoordinate.x - 100;
            const isCollidingRight = offsetRight > 0;

            offsetLeft = collider.getLeft() - playerTileCoordinate.x;
            const isCollidingLeft = offsetLeft < 0;

            offsetDown = collider.getBottom() - playerTileCoordinate.y - 100;
            const isCollidingDown = offsetDown > 0;

            offsetUp = collider.getTop() - playerTileCoordinate.y;
            const isCollidingUp = offsetUp < 0;

            this.#logger.log('player collisions', {
                isCollidingRight,
                isCollidingLeft,
                isCollidingDown,
                isCollidingUp
            });

            // if(isCollidingRight && isCollidingUp){
            //     if(offsetRight < offsetUp){
            //         offset.add(new Vector(-offsetRight, 0));
            //     }
            //     else{
            //         offset.add(new Vector(0, -offsetUp));
            //     }
            // }
            // else if (isCollidingRight){
            //     offset.add(new Vector(-offsetRight, 0));
            // }
            // else{
            //     offset.add(new Vector(0, -offsetUp));
            // }

            // if(isCollidingRight && isCollidingDown){
            //     if(offsetRight < offsetDown){
            //         offset.add(new Vector(-offsetRight, 0));
            //     }
            //     else{
            //         offset.add(new Vector(0, -offsetDown));
            //     }
            // }
            // else if (isCollidingRight){
            //     offset.add(new Vector(-offsetRight, 0));
            // }
            // else{
            //     offset.add(new Vector(0, -offsetDown));
            // }


            // if (isCollidingDown || isCollidingLeft || isCollidingRight || isCollidingUp) {
            //     console.log('overlap', `up: ${isCollidingUp} right: ${isCollidingRight} down: ${isCollidingDown} left: ${isCollidingLeft} `);
            // }


           
            // let colliders = Object.keys(neighbours)
            //     .map(key => neighbours[key])
            //     .flat()
            //     .map((index) => {
            //         return new Rectangle(Grid.convertIndexToCoordinate(index, 15, 15).multiplyScalar(100).add(new Vector(50, 50)), 100, 100);
            //     });

            // this.#colliders = [collider.clone(), ...colliders];

            //   let newOffSet = resolveCollisions(collider, colliders);

            // if (newOffSet.x != 0 || newOffSet.y != 0) {
            //     console.log('newOffSet', newOffSet);
            // }

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

            // this.#player.move(offset);


            prev = now;

            this.#eventDispatcher.dispatch(this.#events.UPDATE, {
                grid: this.#grid,
                player: this.#player,
                direction: this.#player.getDirection(),
                playerState: this.#player.getState(),
                gridIndex,
                bombs: this.#bombShop.getActiveBombs() || [],
                blasts: this.#bombShop.getActiveBlasts() || [],
                colliders: this.#colliders
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
                    targets = targets.concat(this.#getExplosionTargets(tiles));
                });

            this.#bombShop.createExplosion(index, 30, 800);

            targets.forEach((target) => {
                this.#bombShop.createExplosion(target, 30, 800);
            });

        });

        this.#bombShop.onExplosion((index) => {
            console.log('onExplosion');
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

    // #getExplosionTargets(tiles) {
    //     let targets = new SinglyLinkedList();
    //     let hasHitDeadEnd = false;
    //     let index = 0;
    //     let targetIndex;

    //     if (tiles && Array.isArray(tiles)) {

    //         while (!hasHitDeadEnd && index < tiles.length) {
    //             targetIndex = tiles[index];
    //             hasHitDeadEnd = this.#grid.getElementAt(targetIndex) === TileState.INDESTRUCTIBLE || this.#grid.getElementAt(targetIndex) === TileState.OCEAN;
    //             if (!hasHitDeadEnd && this.#grid.getElementAt(targetIndex) !== TileState.INDESTRUCTIBLE) {
    //                 targets.push(targetIndex);
    //             }

    //             if (this.#grid.getElementAt(targetIndex) !== TileState.DESTRUCTABLE) {
    //                 index++;
    //             }
    //             else {
    //                 hasHitDeadEnd = true;
    //             }
    //         }
    //     }

    //     return targets;
    // }

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

        // if (this.#gameInProgess) {
        //     this.#eventDispatcher.dispatch(this.#events.UPDATE, {
        //         grid: this.#grid,
        //         player: this.#player
        //     });
        // }
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