import directions from "../helpers/direction";
import Animation from "../helpers/animation";
import SpriteSheet from "../helpers/spritesheet";
import Grid from "../structures/grid";
import { PlayerState } from '../player';

class CanvasRenderer {
    #canvas;
    #context;
    #cellSize;
    #borderWidth;
    #spriteSheet;
    #animations;
    #previousTime;
    #currentTime;
    #deltaTime;



    constructor(canvas, cellSize = 50, columnCount = 11, rowCount = 11) {
        this.#borderWidth = 100;
        this.#canvas = canvas;
        this.#context = canvas.getContext('2d');
        this.#cellSize = cellSize;
        this.#animations = {};
        this.#spriteSheet = new SpriteSheet('./images/dino-sprites.png');
        this.#loadSprites();
        this.#previousTime = 0;

        this.#canvas.height = this.#cellSize * columnCount + (this.#borderWidth * 2);
        this.#canvas.width = this.#cellSize * rowCount + (this.#borderWidth * 2);

        const walkLeftOne = this.#spriteSheet.getSprite(`dino-walk-left-1`);
        const walkLeftTwo = this.#spriteSheet.getSprite(`dino-walk-left-2`);
        const walkRightOne = this.#spriteSheet.getSprite(`dino-walk-right-1`);
        const walkRightTwo = this.#spriteSheet.getSprite(`dino-walk-right-2`);
        this.#animations.walkLeft = new Animation(this.#spriteSheet, 'walk-left', [walkLeftOne, walkLeftTwo], 200);
        this.#animations.walkRight = new Animation(this.#spriteSheet, 'walk-right', [walkRightOne, walkRightTwo], 200);
    }

    clear() {
        this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    drawGrid(grid) {


        this.#context.beginPath();
        // let gridCoordinates = Grid.getGridCoordinates();

        let coordinate;

        grid.forEach((element, index) => {
            coordinate = Grid.convertIndexToCoordinate(index, 11, 11);
            this.#context.beginPath();

            this.#context.rect(coordinate.x * this.#cellSize + this.#borderWidth,
                coordinate.y * this.#cellSize + this.#borderWidth,
                this.#cellSize,
                this.#cellSize);

            if (element === 0) {
                this.#context.fillStyle = (coordinate.y % 2) === (coordinate.x % 2) ? "#eee" : "#ced7dd";
                this.#context.fill();
            }
            else if (element === 1) {
                this.#context.lineWidth = 1;
                this.#context.fillStyle = "#666";
                this.#context.strokeStyle = "#000";
                this.#context.fill();
                this.#context.stroke();
            }
            else if (element === 2) {
                this.#context.lineWidth = 1;
                this.#context.fillStyle = "#d17026";
                this.#context.strokeStyle = "#000";
                this.#context.fill();
                this.#context.stroke();
            }
            else if (element === 4) {
                this.#context.lineWidth = 1;
                this.#context.fillStyle = "#32a6a8";
                this.#context.strokeStyle = "#000";
                this.#context.fill();
                this.#context.stroke();
            }


            this.#context.closePath();
        });

        this.#context.closePath();
    } q


    drawPlayer(player, state, direction, gridIndex) {
        let gridCoordinate = Grid.convertIndexToCoordinate(gridIndex, 11, 11);
        this.#currentTime = performance.now();
        this.#deltaTime = this.#currentTime - this.#previousTime;
        this.#previousTime = this.#currentTime;

        this.#animations.walkLeft.update(this.#deltaTime);
        this.#animations.walkRight.update(this.#deltaTime);

        if (player && direction) {

            this.#context.beginPath();
            this.#context.fillStyle = "#fcfabb";
            this.#context.rect(
                gridCoordinate.x * this.#cellSize + this.#borderWidth,
                gridCoordinate.y * this.#cellSize + this.#borderWidth,
                this.#cellSize,
                this.#cellSize);

            //  this.#context.rect(
            //     player.getPosition().x + this.#borderWidth - this.#cellSize,
            //     player.getPosition().y + this.#borderWidth - this.#cellSize * 2,
            //     this.#cellSize * 2,
            //     this.#cellSize * 2);

            this.#context.fill();

            this.#context.closePath();
            this.#context.beginPath();

            this.#context.fillStyle = "red";
            this.#context.rect(
                player.getPosition().x + this.#borderWidth - player.getBoundingBox().halfWidth,
                player.getPosition().y + this.#borderWidth - player.getBoundingBox().halfWidth,
                player.getBoundingBox().width,
                player.getBoundingBox().height);
            this.#context.fill();

            this.#context.closePath();
            this.#context.beginPath();


            let sprite;
            if (state === PlayerState.WALKING && direction === directions.LEFT || state === PlayerState.WALKING && direction === directions.DOWN) {
                sprite = this.#animations.walkLeft.getCurrentFrame();
            }
            else if (state === PlayerState.WALKING && direction === directions.RIGHT || state === PlayerState.WALKING && direction === directions.UP) {
                sprite = this.#animations.walkRight.getCurrentFrame();
            }
            else {
                sprite = this.#spriteSheet.getSprite(`dino-stand-${direction.toLowerCase()}`)
            }


            this.#context.fill();

            this.#context.drawImage(
                sprite.image,
                sprite.x,
                sprite.y,
                200,
                200,
                player.getPosition().x + this.#borderWidth - this.#cellSize,
                player.getPosition().y + this.#borderWidth - this.#cellSize * 2 + 20,
                this.#cellSize * 2,
                this.#cellSize * 2);

            this.#context.closePath();
        }
    }
    takeScreenshot() {
        return this.#canvas.toDataURL('png');
    }

    #loadSprites() {
        this.#spriteSheet.addSprite('dino-stand-left', 0, 200, 200, 200);
        this.#spriteSheet.addSprite('dino-stand-down', 0, 0, 200, 200);
        this.#spriteSheet.addSprite('dino-stand-right', 0, 0, 200, 200);
        this.#spriteSheet.addSprite('dino-stand-up', 0, 0, 200, 200);

        this.#spriteSheet.addSprite('dino-walk-right-1', 0, 400, 200, 200);
        this.#spriteSheet.addSprite('dino-walk-right-2', 200, 400, 200, 200);

        this.#spriteSheet.addSprite('dino-walk-left-1', 0, 600, 200, 200);
        this.#spriteSheet.addSprite('dino-walk-left-2', 200, 600, 200, 200);
    }

}

export default CanvasRenderer;