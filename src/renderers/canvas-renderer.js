import directions from "../helpers/direction";
import Animation from "../helpers/animation";
import Drawable from "../helpers/drawable";
import SpriteSheet from "../helpers/spriteSheet";
import Grid from "../structures/grid";
import spriteSheetGeneralConfig from "../config/sprite-sheet-general-0.json";
import spriteSheetEnvironmentConfig from "../config/sprite-sheet-env-0.json";
import spriteSheetItemsConfig from "../config/sprite-sheet-items-0.json";
import { PlayerState } from '../player';
import { TileState } from "../state/tile-state";

class CanvasRenderer {
    #canvas;
    #context;
    #cellSize;
    #borderWidth;
    #spriteSheetGeneral;
    #spriteSheetEnvironment;
    #spriteSheetItems;
    #previousTime;
    #currentTime;
    #deltaTime;
    #drawQueue;
    #columnCount;
    #rowCount;



    constructor(canvas, cellSize = 50, columnCount = 15, rowCount = 15) {
        this.#borderWidth = 100;
        this.#canvas = canvas;
        this.#context = canvas.getContext('2d');
        this.#cellSize = cellSize;
        this.#spriteSheetGeneral = new SpriteSheet('./images/sprite-sheet-general-0.png', spriteSheetGeneralConfig, 1000 / 24);
        this.#spriteSheetEnvironment = new SpriteSheet('./images/sprite-sheet-env-0.png', spriteSheetEnvironmentConfig, 1000 / 24);
        this.#spriteSheetItems = new SpriteSheet('./images/sprite-sheet-items-0.png', spriteSheetItemsConfig, 1000 / 24);
        this.#previousTime = 0;
        this.#drawQueue = [];
        this.#columnCount = columnCount;
        this.#rowCount = rowCount;
        this.#canvas.height = this.#cellSize * columnCount + (this.#borderWidth * 2);
        this.#canvas.width = this.#cellSize * rowCount + (this.#borderWidth * 2);
    }

    clear() {
        this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    drawBasicTile(coordinate) {
        let sprite = this.#spriteSheetEnvironment.getAnimation(`tile-grass`).getCurrentFrame();
        let drawParams = [
            this.#spriteSheetEnvironment.getImage(),
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

    drawBasicSolidBlock(grid, index, coordinate) {
        let color = '#666';
        let drawParams = [
            coordinate.x * this.#cellSize + this.#borderWidth,
            coordinate.y * this.#cellSize + this.#borderWidth,
            this.#cellSize,
            this.#cellSize
        ]

        let neighbours = Grid.getNeighbours(index, 1, this.#columnCount, this.#rowCount);

        let solidNeighbourCount = Object.keys(neighbours).map(key => neighbours[key]).map(neighbourIndex => grid[neighbourIndex]).filter(value => value === 1).length;

        if (solidNeighbourCount > 0) {
            color = '#518bc9';
        }

        this.#drawQueue.push(new Drawable('rect', drawParams, 20, color));




    }

    drawBasicBlock(coordinate) {
        let sprite = this.#spriteSheetEnvironment.getAnimation('destructable-rock').getCurrentFrame();
        let playerSpriteParams = [this.#spriteSheetEnvironment.getImage(),
        sprite.frame.x,
        sprite.frame.y,
        sprite.frame.w,
        sprite.frame.h,
        coordinate.x * this.#cellSize + this.#borderWidth + (this.#cellSize / 2) - (sprite.frame.w / 2),
        coordinate.y * this.#cellSize + this.#borderWidth + (this.#cellSize / 2) - (sprite.frame.h / 2),
        sprite.frame.w,
        sprite.frame.h];

        this.#drawQueue.push(new Drawable('image', playerSpriteParams, coordinate.y * this.#cellSize + this.#borderWidth + 1));
        //     let drawParams = [
        //         coordinate.x * this.#cellSize + this.#borderWidth,
        //         coordinate.y * this.#cellSize + this.#borderWidth,
        //         this.#cellSize,
        //         this.#cellSize
        //     ]
        //     this.#drawQueue.push(new Drawable('rect', drawParams, coordinate.y * this.#cellSize + this.#borderWidth, '#d17026'));
    }

    drawBomb(coordinate) {
        let sprite = this.#spriteSheetItems.getAnimation('egg-teal-wobble').getCurrentFrame();
        let x = coordinate.x * this.#cellSize + this.#borderWidth + (this.#cellSize / 2) - (sprite.frame.w / 2) ;
        let y = coordinate.y * this.#cellSize + this.#borderWidth + (this.#cellSize / 2) - (sprite.frame.h / 2) - 20;

        let bombDrawParams = [
            this.#spriteSheetItems.getImage(),
            sprite.frame.x,
            sprite.frame.y,
            sprite.frame.w,
            sprite.frame.h,
            x,
            y,
            sprite.frame.w,
            sprite.frame.h
        ];

        this.#drawQueue.push(new Drawable('image', bombDrawParams, 80 + y));
    }

    drawRubble(coordinate) {
        let sprite = this.#spriteSheetEnvironment.getAnimation('rock-rubble').getCurrentFrame();
        let playerSpriteParams = [this.#spriteSheetEnvironment.getImage(),
        sprite.frame.x,
        sprite.frame.y,
        sprite.frame.w,
        sprite.frame.h,
        coordinate.x * this.#cellSize + this.#borderWidth + (this.#cellSize / 2) - (sprite.frame.w / 2),
        coordinate.y * this.#cellSize + this.#borderWidth + (this.#cellSize / 2) - (sprite.frame.h / 2),
        sprite.frame.w,
        sprite.frame.h];

        this.#drawQueue.push(new Drawable('image', playerSpriteParams, coordinate.y * this.#cellSize + this.#borderWidth + 1));
    }


    drawScorch(coordinate) {
        let sprite = this.#spriteSheetEnvironment.getAnimation('scorched-terrain').getCurrentFrame();
        let playerSpriteParams = [this.#spriteSheetEnvironment.getImage(),
        sprite.frame.x,
        sprite.frame.y,
        sprite.frame.w,
        sprite.frame.h,
        coordinate.x * this.#cellSize + this.#borderWidth + (this.#cellSize / 2) - (sprite.frame.w / 2),
        coordinate.y * this.#cellSize + this.#borderWidth + (this.#cellSize / 2) - (sprite.frame.h / 2),
        sprite.frame.w,
        sprite.frame.h];

        this.#drawQueue.push(new Drawable('image', playerSpriteParams, coordinate.y * this.#cellSize + this.#borderWidth + 1));
    }

    drawGrid(grid) {

        let coordinate;

        grid.forEach((element, index) => {
            coordinate = Grid.convertIndexToCoordinate(index, 15, 15);
            this.#context.beginPath();

            if (element === TileState.EMPTY) {
                this.drawBasicTile(coordinate);
            }
            else if (element === TileState.INDESTRUCTIBLE) {
                this.drawBasicSolidBlock(grid, index, coordinate);
            }
            else if (element === TileState.DESTRUCTABLE) {
                this.drawBasicTile(coordinate);
                this.drawBasicBlock(coordinate);
            }
            else if (element === TileState.BOMB) {
                this.drawBasicTile(coordinate);
                this.drawBomb(coordinate);
            }
            else if (element === TileState.RUBBLE) {
                this.drawBasicTile(coordinate);
                this.drawRubble(coordinate);
            }
            else if (element === TileState.SCORCH) {
                this.drawBasicTile(coordinate);
                this.drawScorch(coordinate);
            }
            else if (element === TileState.BOMB_RUBBLE) {
                this.drawBasicTile(coordinate);
                this.drawRubble(coordinate);
                this.drawBomb(coordinate);
            }
            else if (element === TileState.BOMB_SCORCH) {
                this.drawBasicTile(coordinate);
                this.drawScorch(coordinate);
                this.drawBomb(coordinate);
            }
            else if (element === TileState.RUBBLE_SCORCH) {
                this.drawBasicTile(coordinate);
                this.drawRubble(coordinate);
                this.drawScorch(coordinate);
            }
            else if (element === TileState.BOMB_RUBBLE_SCORCH) {
                this.drawBasicTile(coordinate);
                this.drawRubble(coordinate);
                this.drawScorch(coordinate);
                this.drawBomb(coordinate);
            }
        });
    }


    drawPlayer(player, state, direction, gridIndex) {
        this.#currentTime = performance.now();
        this.#deltaTime = this.#currentTime - this.#previousTime;
        this.#previousTime = this.#currentTime;

        if (player && direction) {

            let sprite;
            if (state === PlayerState.WALKING && direction === directions.LEFT) {
                sprite = this.#spriteSheetGeneral.getAnimation('dino-rex-walking-left').getCurrentFrame();
            }
            else if (state === PlayerState.WALKING && direction === directions.DOWN) {
                sprite = this.#spriteSheetGeneral.getAnimation('dino-rex-walking-down').getCurrentFrame();
            }
            else if (state === PlayerState.WALKING && direction === directions.RIGHT) {
                sprite = this.#spriteSheetGeneral.getAnimation('dino-rex-walking-right').getCurrentFrame();
            }
            else if (state === PlayerState.WALKING && direction === directions.UP) {
                sprite = this.#spriteSheetGeneral.getAnimation('dino-rex-walking-up').getCurrentFrame();
            }
            else {
                sprite = this.#spriteSheetGeneral.getAnimation(`dino-rex-idle-${direction.toLowerCase()}`).getCurrentFrame()
            }

            this.#context.fill();
            let x = player.getPosition().x + this.#borderWidth - sprite.frame.w / 2;
            let y = player.getPosition().y + this.#borderWidth - sprite.frame.h  + 48;
            let playerSpriteParams = [this.#spriteSheetGeneral.getImage(),
            sprite.frame.x,
            sprite.frame.y,
            sprite.frame.w,
            sprite.frame.h,
                x,
                y,
            sprite.frame.w,
            sprite.frame.h];

            this.#drawQueue.push(new Drawable('image', playerSpriteParams, 99 + player.getPosition().y));

            // let drawParams = [
            //     player.getPosition().x + this.#borderWidth - player.getBoundingBox().halfWidth,
            //     player.getPosition().y + this.#borderWidth - player.getBoundingBox().halfWidth,
            //     player.getBoundingBox().width,
            //     player.getBoundingBox().height
            // ]

            // this.#drawQueue.push(new Drawable('rect', drawParams, 20, 'red'));
        }
    }

    draw() {
        this.#spriteSheetGeneral.updateAnimations(this.#deltaTime);
        this.#spriteSheetEnvironment.updateAnimations(this.#deltaTime);
        this.#spriteSheetItems.updateAnimations(this.#deltaTime);

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