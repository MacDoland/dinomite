import directions from "../helpers/direction";
import EventDispatcher from "../helpers/event-dispatcher";
import Grid from "../structures/grid";
import Timer from "../helpers/timer";
import Vector from "../structures/vector";
import InputManager from "./input-manager";
import AudioManager from "./audio-manager";
import Player from "../player";
import BombShop from "./bomb-shop";

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

    constructor(grid) {
        this.#grid = grid;
        this.#timer = new Timer();
        this.#gameInProgess = false;
        this.#moveDelay = 150;

        this.#player = new Player();
        this.#player.move(new Vector(155, 155));
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
            TICK: 'TICK'
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
        const speed = 500;
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

            if (input.SPACE) {
                this.#bombShop.plant(gridIndex);
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
                gridIndex
            });

            requestAnimationFrame(loop);

        }

        this.#bombShop.onPlant(({ index }) => {
            console.log('PLANT FIRED', index)
            this.#grid.set(index, 4);
        });

        this.#bombShop.onExplode(({ index, strength }) => {
            console.log('EXPLODE FIRED', index)
            this.#grid.set(index, 0);
            let neighbours = this.#grid.getNeighbours(index);

            if (neighbours && neighbours[directions.UP] && this.#grid.getElementAt(neighbours[directions.UP]) === 2) {
                this.#grid.set(neighbours[directions.UP], 0);
            }

            if (neighbours && neighbours[directions.DOWN] && this.#grid.getElementAt(neighbours[directions.DOWN]) === 2) {
                this.#grid.set(neighbours[directions.DOWN], 0);
            }

            if (neighbours && neighbours[directions.LEFT] && this.#grid.getElementAt(neighbours[directions.LEFT]) === 2) {
                this.#grid.set(neighbours[directions.LEFT], 0);
            }

            if (neighbours && neighbours[directions.RIGHT] && this.#grid.getElementAt(neighbours[directions.RIGHT]) === 2) {
                this.#grid.set(neighbours[directions.RIGHT], 0);
            }
        });


        requestAnimationFrame(loop);
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
        return index > 0 && index < grid.getGrid().length && (grid.getGrid()[index] === 0 || grid.getGrid()[index] === 4);
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