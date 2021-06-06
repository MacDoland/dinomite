import directions from "../helpers/direction";
import Animation from "../helpers/animation";
import Drawable from "../helpers/drawable";
import SpriteSheet from "../helpers/spritesheet";
import Grid from "../structures/grid";
import spritesheetConfig from "../config/sprite-sheet.json";
import { PlayerState } from '../player';

class CanvasRenderer {
    #canvas;
    #context;
    #cellSize;
    #borderWidth;
    #spriteSheet;
    #previousTime;
    #currentTime;
    #deltaTime;
    #drawQueue;



    constructor(canvas, cellSize = 50, columnCount = 11, rowCount = 11) {
        this.#borderWidth = 100;
        this.#canvas = canvas;
        this.#context = canvas.getContext('2d');
        this.#cellSize = cellSize;
        this.#spriteSheet = new SpriteSheet('./images/sprite-sheet.png', spritesheetConfig, 1000 / 24);
        this.#previousTime = 0;
        this.#drawQueue = [];

        this.#canvas.height = this.#cellSize * columnCount + (this.#borderWidth * 2);
        this.#canvas.width = this.#cellSize * rowCount + (this.#borderWidth * 2);
    }

    clear() {
        this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    drawBasicTile(coordinate) {
        let sprite = this.#spriteSheet.getAnimation(`tile-grass`).getCurrentFrame();
        let drawParams = [
            this.#spriteSheet.getImage(),
            sprite.frame.x,
            sprite.frame.y,
            sprite.frame.w,
            sprite.frame.h,
            coordinate.x * this.#cellSize + this.#borderWidth,
            coordinate.y * this.#cellSize + this.#borderWidth,
            sprite.frame.w,
            sprite.frame.h];

        this.#drawQueue.push(new Drawable('image', drawParams, 0));

        // let drawParams = [
        //     coordinate.x * this.#cellSize + this.#borderWidth,
        //     coordinate.y * this.#cellSize + this.#borderWidth,
        //     this.#cellSize,
        //     this.#cellSize
        // ]

        //let fillStyle = (coordinate.y % 2) === (coordinate.x % 2) ? "#eee" : "#ced7dd";

        //this.#drawQueue.push(new Drawable('rect', drawParams, 0, fillStyle, '#000'));
    }

    drawBasicSolidBlock(coordinate) {
        let drawParams = [
            coordinate.x * this.#cellSize + this.#borderWidth,
            coordinate.y * this.#cellSize + this.#borderWidth,
            this.#cellSize,
            this.#cellSize
        ]

        this.#drawQueue.push(new Drawable('rect', drawParams, 20, '#666', '#000'));
    }

    drawBasicBlock(coordinate) {
        let drawParams = [
            coordinate.x * this.#cellSize + this.#borderWidth,
            coordinate.y * this.#cellSize + this.#borderWidth,
            this.#cellSize,
            this.#cellSize
        ]

        this.#drawQueue.push(new Drawable('rect', drawParams, 50, '#d17026', '#000'));
    }

    drawBomb(coordinate) {
        let sprite = this.#spriteSheet.getAnimation('egg-teal-wobble').getCurrentFrame();
        let x = coordinate.x * this.#cellSize + this.#borderWidth - (sprite.frame.w - this.#cellSize) / 2;
        let y = coordinate.y * this.#cellSize + this.#borderWidth - (sprite.frame.h - this.#cellSize) / 2 - 30;

        this.drawBasicTile(coordinate);

        let bombDrawParams = [
            this.#spriteSheet.getImage(),
            sprite.frame.x,
            sprite.frame.y,
            sprite.frame.w,
            sprite.frame.h,
            x,
            y,
            sprite.frame.w,
            sprite.frame.h
        ];

        this.#drawQueue.push(new Drawable('image', bombDrawParams, 100 + y));
    }

    drawGrid(grid) {

        let coordinate;

        grid.forEach((element, index) => {
            coordinate = Grid.convertIndexToCoordinate(index, 11, 11);
            this.#context.beginPath();

            if (element === 0) {
                this.drawBasicTile(coordinate);
            }
            else if (element === 1) {
                this.drawBasicSolidBlock(coordinate);
            }
            else if (element === 2) {
                this.drawBasicBlock(coordinate);
            }
            else if (element === 4) {
                this.drawBomb(coordinate);
            }
        });
    }


    drawPlayer(player, state, direction, gridIndex) {
        this.#currentTime = performance.now();
        this.#deltaTime = this.#currentTime - this.#previousTime;
        this.#previousTime = this.#currentTime;


        if (player && direction) {
            this.#context.beginPath();


            let sprite;
            if (state === PlayerState.WALKING && direction === directions.LEFT || state === PlayerState.WALKING && direction === directions.DOWN) {
                //sprite = this.#animations.walkLeft.getCurrentFrame();
                sprite = this.#spriteSheet.getAnimation('dino-rex-walking-left').getCurrentFrame();
            }
            else if (state === PlayerState.WALKING && direction === directions.RIGHT || state === PlayerState.WALKING && direction === directions.UP) {
                sprite = this.#spriteSheet.getAnimation('dino-rex-walking-right').getCurrentFrame();
            }
            else {
                sprite = this.#spriteSheet.getAnimation(`dino-rex-idle-${direction.toLowerCase()}`).getCurrentFrame()
            }
            this.#context.fill();
            let x = player.getPosition().x + this.#borderWidth - sprite.frame.w / 2;
            let y = player.getPosition().y + this.#borderWidth - sprite.frame.h;
            let playerSpriteParams = [this.#spriteSheet.getImage(),
            sprite.frame.x,
            sprite.frame.y,
            sprite.frame.w,
            sprite.frame.h,
                x,
                y,
            sprite.frame.w,
            sprite.frame.h];

            this.#drawQueue.push(new Drawable('image', playerSpriteParams, 99 + player.getPosition().y));
        }
    }

    draw() {
        this.#spriteSheet.updateAnimations(this.#deltaTime);

        this.#drawQueue.sort((a, b) => {
            if (a.zIndex > b.zIndex) return 1;
            if (a.zIndex < b.zIndex) return -1;
            return 0;
        }).forEach(drawable => drawable.draw(this.#context));

        this.#drawQueue = [];
    }
    takeScreenshot() {
        return this.#canvas.toDataURL('png');
    }
}

export default CanvasRenderer;