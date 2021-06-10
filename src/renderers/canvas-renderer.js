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

    drawBasicTile(coordinate, index) {
        let sprite = this.#spriteSheetEnvironment.getRandomFrame(`tile-grass-random`, index);
        let drawParams = [
            this.#spriteSheetEnvironment.getImage(),
            sprite.frame.x,
            sprite.frame.y,
            sprite.frame.w,
            sprite.frame.h,
            coordinate.x * this.#cellSize + this.#borderWidth,
            coordinate.y * this.#cellSize + this.#borderWidth,
            this.#cellSize,
            this.#cellSize];

        this.#drawQueue.push(new Drawable('image', drawParams, 0));
    }

    drawBasicSolidBlock(coordinate) {
        let sprite = this.#spriteSheetEnvironment.getAnimation('indestructable-terrain').getCurrentFrame();
        let playerSpriteParams = [this.#spriteSheetEnvironment.getImage(),
        sprite.frame.x,
        sprite.frame.y,
        sprite.frame.w,
        sprite.frame.h,
        coordinate.x * this.#cellSize + this.#borderWidth + (this.#cellSize / 2) - (sprite.frame.w / 2),
        coordinate.y * this.#cellSize + this.#borderWidth + this.#cellSize - sprite.frame.h,
        sprite.frame.w,
        sprite.frame.h];

        this.#drawQueue.push(new Drawable('image', playerSpriteParams, coordinate.y * this.#cellSize + this.#borderWidth + 1));
    }

    drawOcean(grid, index, coordinate) {
        let color = '#6ebcd2';
        let drawParams = [
            coordinate.x * this.#cellSize + this.#borderWidth,
            coordinate.y * this.#cellSize + this.#borderWidth,
            this.#cellSize,
            this.#cellSize
        ]

        let neighbours = Grid.getNeighbours(index, 1, this.#columnCount, this.#rowCount);

        if (neighbours[directions.UP].length > 0 && grid[neighbours[directions.UP][0]] !== TileState.OCEAN) {
            let sprite = this.#spriteSheetEnvironment.getAnimation('grass-edge-bottom').getCurrentFrame();
            let spriteParams = [this.#spriteSheetEnvironment.getImage(),
            sprite.frame.x,
            sprite.frame.y,
            sprite.frame.w,
            sprite.frame.h,
            coordinate.x * this.#cellSize + this.#borderWidth,
            coordinate.y * this.#cellSize + this.#borderWidth,
            this.#cellSize,
            this.#cellSize];

            this.#drawQueue.push(new Drawable('image', spriteParams, coordinate.y * this.#cellSize + this.#borderWidth - 150));
        }

        if (neighbours[directions.DOWN].length > 0 && grid[neighbours[directions.DOWN][0]] !== TileState.OCEAN) {
            let sprite = this.#spriteSheetEnvironment.getAnimation('grass-edge-top').getCurrentFrame();
            let spriteParams = [this.#spriteSheetEnvironment.getImage(),
            sprite.frame.x,
            sprite.frame.y,
            sprite.frame.w,
            sprite.frame.h,
            coordinate.x * this.#cellSize + this.#borderWidth,
            coordinate.y * this.#cellSize + this.#borderWidth,
            this.#cellSize,
            this.#cellSize];

            this.#drawQueue.push(new Drawable('image', spriteParams, coordinate.y * this.#cellSize + this.#borderWidth - 150));
        }

        if (neighbours[directions.RIGHT].length > 0 && grid[neighbours[directions.RIGHT][0]] !== TileState.OCEAN) {
            let sprite = this.#spriteSheetEnvironment.getAnimation('grass-edge-left').getCurrentFrame();
            let spriteParams = [this.#spriteSheetEnvironment.getImage(),
            sprite.frame.x,
            sprite.frame.y,
            sprite.frame.w,
            sprite.frame.h,
            coordinate.x * this.#cellSize + this.#borderWidth,
            coordinate.y * this.#cellSize + this.#borderWidth,
            this.#cellSize,
            this.#cellSize];

            this.#drawQueue.push(new Drawable('image', spriteParams, coordinate.y * this.#cellSize + this.#borderWidth - 150));
        }

        if (neighbours[directions.LEFT].length > 0 && grid[neighbours[directions.LEFT][0]] !== TileState.OCEAN) {
            let sprite = this.#spriteSheetEnvironment.getAnimation('grass-edge-right').getCurrentFrame();
            let spriteParams = [this.#spriteSheetEnvironment.getImage(),
            sprite.frame.x,
            sprite.frame.y,
            sprite.frame.w,
            sprite.frame.h,
            coordinate.x * this.#cellSize + this.#borderWidth,
            coordinate.y * this.#cellSize + this.#borderWidth,
            this.#cellSize,
            this.#cellSize];

            this.#drawQueue.push(new Drawable('image', spriteParams, coordinate.y * this.#cellSize + this.#borderWidth - 150));
        }

        if (neighbours[directions.UP].length > 0
            && neighbours[directions.RIGHT].length > 0
            && grid[neighbours[directions.UP][0]] === TileState.OCEAN
            && grid[neighbours[directions.RIGHT][0]] === TileState.OCEAN
            && grid[neighbours[directions.RIGHTUP][0]] !== TileState.OCEAN) {
            let sprite = this.#spriteSheetEnvironment.getAnimation('grass-edge-corner-bottom-left').getCurrentFrame();
            let spriteParams = [this.#spriteSheetEnvironment.getImage(),
            sprite.frame.x,
            sprite.frame.y,
            sprite.frame.w,
            sprite.frame.h,
            coordinate.x * this.#cellSize + this.#borderWidth,
            coordinate.y * this.#cellSize + this.#borderWidth,
            this.#cellSize,
            this.#cellSize];

            this.#drawQueue.push(new Drawable('image', spriteParams, coordinate.y * this.#cellSize + this.#borderWidth - 150));
        }

        if (neighbours[directions.UP].length > 0
            && neighbours[directions.LEFT].length > 0
            && grid[neighbours[directions.UP][0]] === TileState.OCEAN
            && grid[neighbours[directions.LEFT][0]] === TileState.OCEAN
            && grid[neighbours[directions.LEFTUP][0]] !== TileState.OCEAN) {
            let sprite = this.#spriteSheetEnvironment.getAnimation('grass-edge-corner-bottom-right').getCurrentFrame();
            let spriteParams = [this.#spriteSheetEnvironment.getImage(),
            sprite.frame.x,
            sprite.frame.y,
            sprite.frame.w,
            sprite.frame.h,
            coordinate.x * this.#cellSize + this.#borderWidth,
            coordinate.y * this.#cellSize + this.#borderWidth,
            this.#cellSize,
            this.#cellSize];

            this.#drawQueue.push(new Drawable('image', spriteParams, coordinate.y * this.#cellSize + this.#borderWidth - 150));
        }

        if (neighbours[directions.DOWN].length > 0
            && neighbours[directions.RIGHT].length > 0
            && grid[neighbours[directions.DOWN][0]] === TileState.OCEAN
            && grid[neighbours[directions.RIGHT][0]] === TileState.OCEAN
            && grid[neighbours[directions.RIGHTDOWN][0]] !== TileState.OCEAN) {
            let sprite = this.#spriteSheetEnvironment.getAnimation('grass-edge-corner-top-left').getCurrentFrame();
            let spriteParams = [this.#spriteSheetEnvironment.getImage(),
            sprite.frame.x,
            sprite.frame.y,
            sprite.frame.w,
            sprite.frame.h,
            coordinate.x * this.#cellSize + this.#borderWidth,
            coordinate.y * this.#cellSize + this.#borderWidth,
            this.#cellSize,
            this.#cellSize];

            this.#drawQueue.push(new Drawable('image', spriteParams, coordinate.y * this.#cellSize + this.#borderWidth - 150));
        }

        if (neighbours[directions.DOWN].length > 0
            && neighbours[directions.LEFT].length > 0
            && grid[neighbours[directions.DOWN][0]] === TileState.OCEAN
            && grid[neighbours[directions.LEFT][0]] === TileState.OCEAN
            && grid[neighbours[directions.LEFTDOWN][0]] !== TileState.OCEAN) {
            let sprite = this.#spriteSheetEnvironment.getAnimation('grass-edge-corner-top-right').getCurrentFrame();
            let spriteParams = [this.#spriteSheetEnvironment.getImage(),
            sprite.frame.x,
            sprite.frame.y,
            sprite.frame.w,
            sprite.frame.h,
            coordinate.x * this.#cellSize + this.#borderWidth,
            coordinate.y * this.#cellSize + this.#borderWidth,
            this.#cellSize,
            this.#cellSize];

            this.#drawQueue.push(new Drawable('image', spriteParams, coordinate.y * this.#cellSize + this.#borderWidth - 150));
        }




        this.#drawQueue.push(new Drawable('rect', drawParams, 20, color));
    }

    drawBasicBlock(coordinate, index) {
        let sprite = this.#spriteSheetEnvironment.getRandomFrame('destructable-rock-random', index);
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

    drawBomb(coordinate, bomb) {
        let duration = bomb.getTimerDuration();
        let timeLeft = bomb.getTimeToDetonation();
        let isUnderHalfTimeLeft = timeLeft < (duration / 2);


        let sprite = isUnderHalfTimeLeft 
        ? this.#spriteSheetItems.getAnimation('egg-teal-crack').getFrameAt(duration - timeLeft, duration)
        : this.#spriteSheetItems.getAnimation('egg-teal-wobble-loop').getCurrentFrame();

        let x = coordinate.x * this.#cellSize + this.#borderWidth + (this.#cellSize / 2) - (sprite.frame.w / 2);
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

    drawExplosion(coordinate) {
        let sprite = this.#spriteSheetItems.getAnimation('explosion-center-loop').getCurrentFrame();
        let drawParams = [
            this.#spriteSheetItems.getImage(),
            sprite.frame.x,
            sprite.frame.y,
            sprite.frame.w,
            sprite.frame.h,
            coordinate.x * this.#cellSize + this.#borderWidth,
            coordinate.y * this.#cellSize + this.#borderWidth,
            this.#cellSize,
            this.#cellSize];

        this.#drawQueue.push(new Drawable('image', drawParams, coordinate.y * this.#cellSize + this.#borderWidth + 5));
    }

    drawShadow(coordinate) {
        // let color = 'rgba(0,0,0,0.2)';
        // let drawParams = [
        //     coordinate.x * this.#cellSize + this.#borderWidth + 5,
        //     coordinate.y * this.#cellSize + this.#borderWidth - 20,
        //     this.#cellSize,
        //     this.#cellSize
        // ]

        // this.#drawQueue.push(new Drawable('rect', drawParams, coordinate.y * this.#cellSize + this.#borderWidth - 100, color));
        let sprite = this.#spriteSheetEnvironment.getAnimation('shadow-indestructable').getCurrentFrame();
        let playerSpriteParams = [this.#spriteSheetEnvironment.getImage(),
        sprite.frame.x,
        sprite.frame.y,
        sprite.frame.w,
        sprite.frame.h,
        coordinate.x * this.#cellSize + this.#borderWidth + (this.#cellSize / 2) - (sprite.frame.w / 2) + 10,
        coordinate.y * this.#cellSize + this.#borderWidth + this.#cellSize - sprite.frame.h - 10,
        sprite.frame.w,
        sprite.frame.h];

        this.#drawQueue.push(new Drawable('image', playerSpriteParams, coordinate.y * this.#cellSize + this.#borderWidth - 100));
    }

    drawGrid(grid, config, bombs) {

        let coordinate, bomb, bombsByIndex;

        grid.forEach((element, index) => {
            coordinate = Grid.convertIndexToCoordinate(index, 15, 15);
            this.#context.beginPath();

            bombsByIndex = bombs.filter((bomb) => bomb.getIndex() === index);

            bomb = bombsByIndex.length > 0 ? bombsByIndex[0] : null;

            if (element === TileState.EMPTY) {
                this.drawBasicTile(coordinate, index);
            }
            else if (element === TileState.INDESTRUCTIBLE) {
                this.drawBasicTile(coordinate, index);
                this.drawShadow(coordinate);

                this.drawBasicSolidBlock(coordinate);
            }
            else if (element === TileState.OCEAN) {
                this.drawOcean(grid, index, coordinate);
            }
            else if (element === TileState.DESTRUCTABLE) {
                this.drawBasicTile(coordinate);
                this.drawBasicBlock(coordinate, index);
            }
            else if (element === TileState.BOMB) {
                this.drawBasicTile(coordinate);
                this.drawBomb(coordinate, bomb);
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
                this.drawBomb(coordinate, bomb);
            }
            else if (element === TileState.BOMB_SCORCH) {
                this.drawBasicTile(coordinate);
                this.drawScorch(coordinate);
                this.drawBomb(coordinate, bomb);
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
                this.drawBomb(coordinate, bomb);
            }
            else if (element === TileState.EXPLOSION) {
                this.drawBasicTile(coordinate);
                this.drawExplosion(coordinate);
            }
            else if (element === TileState.EXPLOSION_RUBBLE) {
                this.drawBasicTile(coordinate);
                this.drawRubble(coordinate);
                this.drawExplosion(coordinate);
            }
            else if (element === TileState.EXPLOSION_SCORCH) {
                this.drawBasicTile(coordinate);
                this.drawScorch(coordinate);
                this.drawExplosion(coordinate);
            }
            else if (element === TileState.EXPLOSION_RUBBLE_SCORCH) {
                this.drawBasicTile(coordinate);
                this.drawRubble(coordinate);
                this.drawScorch(coordinate);
                this.drawExplosion(coordinate);
            }

            if (config.showGrid) {
                let drawParams = [
                    coordinate.x * this.#cellSize + this.#borderWidth,
                    coordinate.y * this.#cellSize + this.#borderWidth,
                    this.#cellSize,
                    this.#cellSize
                ]
                this.#drawQueue.push(new Drawable('rect', drawParams, coordinate.y * this.#cellSize + this.#borderWidth + 100, false, '#000'));
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
                sprite = this.#spriteSheetGeneral.getAnimation('dino-rex-walking-left-loop').getCurrentFrame();
            }
            else if (state === PlayerState.WALKING && direction === directions.DOWN) {
                sprite = this.#spriteSheetGeneral.getAnimation('dino-rex-walking-down-loop').getCurrentFrame();
            }
            else if (state === PlayerState.WALKING && direction === directions.RIGHT) {
                sprite = this.#spriteSheetGeneral.getAnimation('dino-rex-walking-right-loop').getCurrentFrame();
            }
            else if (state === PlayerState.WALKING && direction === directions.UP) {
                sprite = this.#spriteSheetGeneral.getAnimation('dino-rex-walking-up-loop').getCurrentFrame();
            }
            else {
                sprite = this.#spriteSheetGeneral.getAnimation(`dino-rex-idle-${direction.toLowerCase()}-loop`).getCurrentFrame()
            }

            this.#context.fill();
            let x = player.getPosition().x + this.#borderWidth - sprite.frame.w / 2;
            let y = player.getPosition().y + this.#borderWidth - sprite.frame.h + 48;
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

        let numDrawCalls = this.#drawQueue.length;
        this.#drawQueue = [];

        return numDrawCalls;
    }
    takeScreenshot() {
        return this.#canvas.toDataURL('png');
    }
}

export default CanvasRenderer;