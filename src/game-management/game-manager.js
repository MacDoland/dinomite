import directions from "../helpers/direction";
import EventDispatcher from "../helpers/event-dispatcher";
import Grid from "../structures/grid";
import Timer from "../helpers/timer";
import Vector from "../structures/vector";
import InputManager from "./input-manager";
import AudioManager from "./audio-manager";
import Player from "../player";

class GameManager {
    #grid;
    #timer;
    #moveDelay;
    #gameInProgess;
    #audioManager;
    #inputManager;
    #eventDispatcher;
    #events;

    #player;

    constructor(grid) {
        this.#grid = grid;
        this.#timer = new Timer();
        this.#gameInProgess = false;
        this.#moveDelay = 150;

        this.#player = new Player();
        this.#player.move(new Vector(175, 175));

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

            potentialPositionX = Vector.add(this.#player.getPosition(), offset.getXOnly());
            potentialPositionY = Vector.add(this.#player.getPosition(), offset.getYOnly());



            let gridCoordinateX = Vector.multiplyScalar(potentialPositionX, 1 / 100).floor();
            let indexX = this.#grid.getIndex(gridCoordinateX.x, gridCoordinateX.y);

            let gridCoordinateY = Vector.multiplyScalar(potentialPositionY, 1 / 100).floor();
            let indexY = this.#grid.getIndex(gridCoordinateY.x, gridCoordinateY.y);

           

            if (indexX > 0 && indexX < this.#grid.getGrid().length && this.#grid.getGrid()[indexX] === 0) {
                this.#player.move(offset.getXOnly());
            }

            if (indexY > 0 && indexY < this.#grid.getGrid().length && this.#grid.getGrid()[indexY] === 0) {
                this.#player.move(offset.getYOnly());
            }

            prev = now;

            this.#eventDispatcher.dispatch(this.#events.UPDATE, {
                grid: this.#grid,
                player: this.#player,
                direction: this.#player.getDirection(),
                playerState: this.#player.getState(),
                gridIndex: indexX
            });

            requestAnimationFrame(loop);

        }

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