import directions from "../helpers/direction";
import Drawable from "../helpers/drawable";
import SpriteSheet from "../helpers/spriteSheet";
import Grid from "../structures/grid";
import spriteSheetGeneralConfig from "../config/sprite-sheet-general-0.json";
import spriteSheetEnvironmentConfig from "../config/sprite-sheet-env-0.json";
import spriteSheetItemsConfig from "../config/sprite-sheet-items-0.json";
import { PlayerState } from '../player';
import { TileState } from "../state/tile-state";
import { BombState } from "../items/bomb";
import { characterNames } from "../state/characters";
import { findById } from "../helpers/helpers";
import { isOceanCornerBottomLeft, isOceanCornerBottomRight, isOceanCornerTopLeft, isOceanCornerTopRight } from "../helpers/grid-helpers";
import { Anchors } from "../helpers/anchor";

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
    #plants;

    constructor(canvas, cellSize = 50, columnCount = 15, rowCount = 15) {
        this.#borderWidth = 0;
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
        this.#canvas.height = this.#cellSize * columnCount;
        this.#canvas.width = this.#cellSize * rowCount;
        this.#plants = [];
    }

    clear() {
        this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    drawImageTile({ queue, image, sprite, coordinate, size, anchor = Anchors.CENTER, zIndex = coordinate.y * size - size, useSpriteDimensions = false, width, height }) {
        let yoffset = 0;

        if (anchor === Anchors.UP) {
            yoffset = yoffset - sprite.frame.h + size;
        }
        else if (anchor === Anchors.BOTTOM) {
            yoffset = yoffset - size / 2;
            zIndex += size;
        }
        else if (anchor === Anchors.CENTER_BOTTOM) {
            yoffset = yoffset - size;
            zIndex += size / 2;
        }

        width = typeof (width) !== 'undefined' ? width : size;
        height = typeof (height) !== 'undefined' ? height : size;


        let drawParams = [
            image,
            sprite.frame.x,
            sprite.frame.y,
            sprite.frame.w,
            sprite.frame.h,
            coordinate.x * size - (width / 2) + (size / 2),
            coordinate.y * size - (height / 2) + (size / 2) + yoffset,
            useSpriteDimensions ? sprite.frame.w : size,
            useSpriteDimensions ? sprite.frame.h : size];

        queue.push(new Drawable('image', drawParams, zIndex));
    }

    drawBasicTile(coordinate, index) {
        const sprite = this.#spriteSheetEnvironment.getRandomFrame('tile-grass-random', index);
        const image = this.#spriteSheetEnvironment.getImage();
        this.drawImageTile({
            queue: this.#drawQueue,
            image,
            sprite,
            coordinate,
            size: this.#cellSize,
            zIndex: 0,
        });
    }

    drawBasicSolidBlock(coordinate) {
        const sprite = this.#spriteSheetEnvironment.getAnimation('indestructable-terrain').getCurrentFrame();
        const image = this.#spriteSheetEnvironment.getImage();
        const zIndex = coordinate.y * this.#cellSize - this.#cellSize + 100;
        this.drawImageTile({
            queue: this.#drawQueue,
            image,
            sprite,
            coordinate,
            anchor: Anchors.UP,
            size: this.#cellSize,
            zIndex,
            useSpriteDimensions: true
        });
    }

    drawOcean(grid, index, coordinate) {
        let color = '#6ebcd2';
        let image = this.#spriteSheetEnvironment.getImage()
        let drawParams = [
            coordinate.x * this.#cellSize + this.#borderWidth,
            coordinate.y * this.#cellSize + this.#borderWidth,
            this.#cellSize,
            this.#cellSize
        ];
        let sprite;

        let neighbours = Grid.getNeighbours(index, 1, this.#columnCount, this.#rowCount);

        if (neighbours[directions.UP].length > 0 && grid[neighbours[directions.UP][0]] !== TileState.OCEAN) {
            sprite = this.#spriteSheetEnvironment.getRandomFrame('grass-edge-bottom-random', index);
            this.drawImageTile({ queue: this.#drawQueue, image, sprite, coordinate, size: this.#cellSize });
        }

        if (neighbours[directions.DOWN].length > 0 && grid[neighbours[directions.DOWN][0]] !== TileState.OCEAN) {
            sprite = this.#spriteSheetEnvironment.getAnimation('grass-edge-top').getCurrentFrame();
            this.drawImageTile({ queue: this.#drawQueue, image, sprite, coordinate, size: this.#cellSize });
        }

        if (neighbours[directions.RIGHT].length > 0 && grid[neighbours[directions.RIGHT][0]] !== TileState.OCEAN) {
            sprite = this.#spriteSheetEnvironment.getAnimation('grass-edge-left').getCurrentFrame();
            this.drawImageTile({ queue: this.#drawQueue, image, sprite, coordinate, size: this.#cellSize });
        }

        if (neighbours[directions.LEFT].length > 0 && grid[neighbours[directions.LEFT][0]] !== TileState.OCEAN) {
            sprite = this.#spriteSheetEnvironment.getAnimation('grass-edge-right').getCurrentFrame();
            this.drawImageTile({ queue: this.#drawQueue, image, sprite, coordinate, size: this.#cellSize });
        }

        if (isOceanCornerBottomLeft(grid, neighbours)) {
            sprite = this.#spriteSheetEnvironment.getAnimation('grass-edge-corner-bottom-left').getCurrentFrame();
            this.drawImageTile({ queue: this.#drawQueue, image, sprite, coordinate, size: this.#cellSize });

        }

        if (isOceanCornerBottomRight(grid, neighbours)) {
            sprite = this.#spriteSheetEnvironment.getAnimation('grass-edge-corner-bottom-right').getCurrentFrame();
            this.drawImageTile({ queue: this.#drawQueue, image, sprite, coordinate, size: this.#cellSize });
        }

        if (isOceanCornerTopLeft(grid, neighbours)) {
            sprite = this.#spriteSheetEnvironment.getAnimation('grass-edge-corner-top-left').getCurrentFrame();
            this.drawImageTile({ queue: this.#drawQueue, image, sprite, coordinate, size: this.#cellSize });
        }

        if (isOceanCornerTopRight(grid, neighbours)) {
            sprite = this.#spriteSheetEnvironment.getAnimation('grass-edge-corner-top-right').getCurrentFrame();
            this.drawImageTile({ queue: this.#drawQueue, image, sprite, coordinate, size: this.#cellSize });
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
    }

    drawBomb(coordinate, bomb, player, players) {
        if (bomb) {

            let ownerId = bomb.owner;

            let bombOwner = findById(players, ownerId);
            if (!bombOwner) {
                return;
            }

            let characterId = bombOwner.getCharacterIndex();
            let character = characterNames[characterId] || 'rex';
            let sprite = bomb.state === BombState.NEAR_DETONATION
                ? this.#spriteSheetItems.getAnimation(`${character}-egg-crack`).getFrameAtProgress(bomb.progress)
                : this.#spriteSheetItems.getAnimation(`${character}-egg-wobble-loop`).getCurrentFrame();

            if (sprite) {
                let x = coordinate.x * this.#cellSize + (this.#cellSize / 2) - (sprite.frame.w / 2);
                let y = coordinate.y * this.#cellSize + (this.#cellSize / 2) - (sprite.frame.h / 2) - 40;

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
        }
    }

    drawRubble(coordinate) {
        const sprite = this.#spriteSheetEnvironment.getAnimation('rock-rubble').getCurrentFrame();
        const image = this.#spriteSheetEnvironment.getImage();
        this.drawImageTile({
            queue: this.#drawQueue,
            image,
            sprite,
            coordinate,
            size: this.#cellSize,
            zIndex: 0,
        });
    }

    drawScorch(coordinate) {
        let sprite = this.#spriteSheetEnvironment.getAnimation('scorched-terrain').getCurrentFrame();
        let playerSpriteParams = [this.#spriteSheetEnvironment.getImage(),
        sprite.frame.x,
        sprite.frame.y,
        sprite.frame.w,
        sprite.frame.h,
        coordinate.x * this.#cellSize + (this.#cellSize / 2) - (sprite.frame.w / 2),
        coordinate.y * this.#cellSize + (this.#cellSize / 2) - (sprite.frame.h / 2),
        sprite.frame.w,
        sprite.frame.h];

        this.#drawQueue.push(new Drawable('image', playerSpriteParams, coordinate.y * this.#cellSize + 1));
    }

    drawExplosion(coordinate, blast) {
        if (blast) {
            let sprite = this.#spriteSheetItems.getAnimation('explosion-center').getFrameAtProgress(blast.progress)

            if (sprite) {
                let drawParams = [
                    this.#spriteSheetItems.getImage(),
                    sprite.frame.x,
                    sprite.frame.y,
                    sprite.frame.w,
                    sprite.frame.h,
                    coordinate.x * this.#cellSize,
                    coordinate.y * this.#cellSize,
                    this.#cellSize,
                    this.#cellSize];

                this.#drawQueue.push(new Drawable('image', drawParams, coordinate.y * this.#cellSize + 200));
            }
        }
    }

    drawShadow(coordinate) {
        let sprite = this.#spriteSheetEnvironment.getAnimation('shadow-indestructable').getCurrentFrame();
        let playerSpriteParams = [this.#spriteSheetEnvironment.getImage(),
        sprite.frame.x,
        sprite.frame.y,
        sprite.frame.w,
        sprite.frame.h,
        coordinate.x * this.#cellSize + (this.#cellSize / 2) - (sprite.frame.w / 2) + 10,
        coordinate.y * this.#cellSize + this.#cellSize - sprite.frame.h - 10,
        sprite.frame.w,
        sprite.frame.h];

        this.#drawQueue.push(new Drawable('image', playerSpriteParams, coordinate.y * this.#cellSize - 100));
    }

    drawStairs(coordinate, index) {
        const sprite = this.#spriteSheetEnvironment.getAnimation('stairs-bottom').getCurrentFrame();
        const image = this.#spriteSheetEnvironment.getImage();
        this.drawImageTile({
            queue: this.#drawQueue,
            image,
            sprite,
            coordinate,
            size: this.#cellSize,
        });
    }

    drawTar(coordinate, index) {
        const sprite = this.#spriteSheetEnvironment.getAnimation('swamp-middle').getCurrentFrame();
        const image = this.#spriteSheetEnvironment.getImage();
        this.drawImageTile({
            queue: this.#drawQueue,
            image,
            sprite,
            coordinate,
            size: this.#cellSize,
        });
    }

    drawGravestone(coordinate) {
        const sprite = this.#spriteSheetItems.getAnimation('grave-appear').getCurrentFrame();
        const image = this.#spriteSheetItems.getImage();
        let x = coordinate.x * this.#cellSize - (sprite.frame.w / 2) + (this.#cellSize / 2);
        let y = coordinate.y * this.#cellSize - (sprite.frame.h / 2) + (this.#cellSize / 2) - (this.#cellSize);
        this.drawImageTile({
            queue: this.#drawQueue,
            image,
            sprite,
            coordinate,
            size: this.#cellSize,
            width: sprite.frame.w,
            height: sprite.frame.h,
            useSpriteDimensions: true,
            anchor: Anchors.BOTTOM
        });

        // const debugDrawParams = [
        //     x,
        //     y,
        //     sprite.frame.w,
        //     sprite.frame.h
        // ]



        // this.#drawQueue.push(new Drawable('rect', debugDrawParams, 10000, false, 'red'));
    }

    drawCliff(coordinate, index) {
        const sprite = this.#spriteSheetEnvironment.getRandomFrame('grass-edge-bottom-random', index);
        const image = this.#spriteSheetEnvironment.getImage();
        this.drawImageTile({
            queue: this.#drawQueue,
            image,
            sprite,
            coordinate,
            size: this.#cellSize,
        });
    }

    drawFern(coordinate) {
        const sprite = this.#spriteSheetEnvironment.getAnimation('plant-fern-large').getCurrentFrame();
        const image = this.#spriteSheetEnvironment.getImage();
        this.drawImageTile({
            queue: this.#drawQueue,
            image,
            sprite,
            coordinate,
            size: this.#cellSize,
            width: sprite.frame.w,
            height: sprite.frame.h,
            useSpriteDimensions: true,
            zIndex: coordinate.y * this.#cellSize - this.#cellSize + 150
        });
    }


    drawGrid(grid, config, bombs, blasts, player, players) {

        let coordinate, bomb, bombsByIndex, blast, blastsByIndex;

        grid.forEach((element, index) => {
            coordinate = Grid.convertIndexToCoordinate(index, 15, 15);
            this.#context.beginPath();

            bombsByIndex = bombs.filter((bomb) => bomb.id == index);
            bomb = bombsByIndex.length > 0 ? bombsByIndex[0] : null;

            blastsByIndex = blasts.filter((blast) => blast.id === index);
            blast = blastsByIndex.length > 0 ? blastsByIndex[0] : null;

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
                this.drawBasicTile(coordinate, index);
                this.drawBasicBlock(coordinate, index);
            }
            else if (element === TileState.BOMB) {
                this.drawBasicTile(coordinate, index);
                this.drawBomb(coordinate, bomb, player, players);
            }
            else if (element === TileState.RUBBLE) {
                this.drawBasicTile(coordinate, index);
                this.drawRubble(coordinate);
            }
            else if (element === TileState.SCORCH) {
                this.drawBasicTile(coordinate, index);
                this.drawScorch(coordinate);
            }
            else if (element === TileState.BOMB_RUBBLE) {
                this.drawBasicTile(coordinate, index);
                this.drawRubble(coordinate);
                this.drawBomb(coordinate, bomb, player, players);
            }
            else if (element === TileState.BOMB_SCORCH) {
                this.drawBasicTile(coordinate, index);
                this.drawScorch(coordinate);
                this.drawBomb(coordinate, bomb, player, players);
            }
            else if (element === TileState.RUBBLE_SCORCH) {
                this.drawBasicTile(coordinate, index);
                this.drawRubble(coordinate);
                this.drawScorch(coordinate);
            }
            else if (element === TileState.BOMB_RUBBLE_SCORCH) {
                this.drawBasicTile(coordinate, index);
                this.drawRubble(coordinate);
                this.drawScorch(coordinate);
                this.drawBomb(coordinate, bomb, player, players);
            }
            else if (element === TileState.EXPLOSION) {
                this.drawBasicTile(coordinate, index);
                this.drawExplosion(coordinate, blast);
            }
            else if (element === TileState.EXPLOSION_RUBBLE) {
                this.drawBasicTile(coordinate, index);
                this.drawRubble(coordinate);
                this.drawExplosion(coordinate, blast);
            }
            else if (element === TileState.EXPLOSION_SCORCH) {
                this.drawBasicTile(coordinate, index);
                this.drawScorch(coordinate);
                this.drawExplosion(coordinate, blast);
            }
            else if (element === TileState.EXPLOSION_RUBBLE_SCORCH) {
                this.drawBasicTile(coordinate, index);
                this.drawRubble(coordinate);
                this.drawScorch(coordinate);
                this.drawExplosion(coordinate, blast);
            }
            else if (element === TileState.STAIRS) {
                this.drawBasicTile(coordinate, index);
                this.drawStairs(coordinate, index);
            }
            else if (element === TileState.STAIRS_BOMB) {
                this.drawBasicTile(coordinate, index);
                this.drawStairs(coordinate, index);
                this.drawBomb(coordinate, bomb, player, players);
            }
            else if (element === TileState.STAIRS_EXPLOSION) {
                this.drawBasicTile(coordinate, index);
                this.drawStairs(coordinate, index);
                this.drawExplosion(coordinate, blast);
            }
            else if (element === TileState.TAR) {
                this.drawBasicTile(coordinate, index);
                this.drawTar(coordinate, index);
            }
            else if (element === TileState.TAR_BOMB) {
                this.drawBasicTile(coordinate, index);
                this.drawTar(coordinate, index);
                this.drawBomb(coordinate, bomb, player, players);
            }
            else if (element === TileState.TAR_EXPLOSION) {
                this.drawBasicTile(coordinate, index);
                this.drawTar(coordinate, index);
                this.drawExplosion(coordinate, blast);
            }
            else if (element === TileState.CLIFF) {
                this.drawBasicTile(coordinate, index);
                this.drawCliff(coordinate, index);
            }
            else if (element === TileState.GRAVESTONE) {
                this.drawBasicTile(coordinate, index);
                this.drawGravestone(coordinate);
            }
            else if (element === TileState.GRAVESTONE_RUBBLE) {
                this.drawBasicTile(coordinate, index);
                this.drawRubble(coordinate);
                this.drawGravestone(coordinate);
                this.drawExplosion(coordinate, blast);
            }
            else if (element === TileState.GRAVESTONE_SORCH) {
                this.drawBasicTile(coordinate, index);
                this.drawScorch(coordinate, index);
                this.drawGravestone(coordinate);
                this.drawExplosion(coordinate, blast);
            }
            else if (element === TileState.GRAVESTONE_TAR) {
                this.drawTar(coordinate, index);
                this.drawGravestone(coordinate);
            }
            else if (element === TileState.GRAVESTONE_STAIRS) {
                this.drawBasicTile(coordinate, index);
                this.drawStairs(coordinate, index);
                this.drawGravestone(coordinate);
                this.drawExplosion(coordinate, blast);
            }
            else if (element === TileState.GRAVESTONE_EXPLOSION) {
                this.drawBasicTile(coordinate, index);
                this.drawExplosion(coordinate, blast);
            }
            else if (element === TileState.GRAVESTONE_EXPLOSION_RUBBLE) {
                this.drawBasicTile(coordinate, index);
                this.drawRubble(coordinate);
                this.drawExplosion(coordinate, blast);
            }
            else if (element === TileState.GRAVESTONE_EXPLOSION_SORCH) {
                this.drawBasicTile(coordinate, index);
                this.drawScorch(coordinate);
                this.drawExplosion(coordinate, blast);
            }
            else if (element === TileState.GRAVESTONE_EXPLOSION_SORCH_RUBBLE) {
                this.drawBasicTile(coordinate, index);
                this.drawRubble(coordinate);
                this.drawScorch(coordinate);
                this.drawExplosion(coordinate, blast);
            }
            else if (element === TileState.GRAVESTONE_EXPLOSION_STAIRS) {
                this.drawBasicTile(coordinate, index);
                this.drawStairs(coordinate, index);
                this.drawExplosion(coordinate, blast);
            }
            else if (element === TileState.GRAVESTONE_EXPLOSION_TAR) {
                this.drawBasicTile(coordinate, index);
                this.drawTar(coordinate, index);
                this.drawExplosion(coordinate, blast);
            }

            if (config.showGrid) {
                let drawParams = [
                    coordinate.x * this.#cellSize,
                    coordinate.y * this.#cellSize,
                    this.#cellSize,
                    this.#cellSize
                ]
                let textParams = [
                    index.toString(),
                    coordinate.x * this.#cellSize + 10,
                    coordinate.y * this.#cellSize + 20,
                ]
                let textGridIdParams = [
                    grid[index].toString(),
                    coordinate.x * this.#cellSize + this.#cellSize / 2,
                    coordinate.y * this.#cellSize + this.#cellSize / 2
                ]
                this.#drawQueue.push(new Drawable('text', textParams, 10000, '#fff'));
                this.#drawQueue.push(new Drawable('text', textGridIdParams, 10000, '#000'));
                this.#drawQueue.push(new Drawable('rect', drawParams, 10000, false, '#000'));
            }
        });


        if (this.#plants.length === 0) {
            let emptySpaces = grid.map((element, index) => {
                return { element, index };
            })

            emptySpaces = emptySpaces.filter((item) => {
                return item && item.element === TileState.EMPTY
            })

            emptySpaces.sort(() => 0.5 - Math.random());

            let plantSpaces = emptySpaces.slice(0, emptySpaces.length / 4);

            plantSpaces.forEach(({ index, element }) => {
                let coordinate = Grid.convertIndexToCoordinate(index, 15, 15);
                this.#plants.push(coordinate);
            })
        }

        this.#plants.forEach(plant => this.drawFern(plant));

    }


    drawPlayers(players) {
        players.forEach(player => {
            let state = player.getState();
            let direction = player.getDirection();

            this.#currentTime = performance.now();
            this.#deltaTime = this.#currentTime - this.#previousTime;
            this.#previousTime = this.#currentTime;
            let character = characterNames[player.getCharacterIndex()] || 'rex';

            if (player && direction && state) {

                let sprite;
                if (state === PlayerState.DEATH) {
                    let timeOfDeath = player.getTimeOfDeath();
                    let currentTime = new Date() - timeOfDeath;
                    let progress = currentTime / 1830;

                    sprite = this.#spriteSheetGeneral.getAnimation(`dino-rex-death-right`).getFrameAtProgress(Math.floor(progress * 100));
                }
                else if (state === PlayerState.WALKING && direction === directions.LEFT) {
                    sprite = this.#spriteSheetGeneral.getAnimation(`dino-${character}-walking-left-loop`).getCurrentFrame();
                }
                else if (state === PlayerState.WALKING && direction === directions.DOWN) {
                    sprite = this.#spriteSheetGeneral.getAnimation(`dino-${character}-walking-down-loop`).getCurrentFrame();
                }
                else if (state === PlayerState.WALKING && direction === directions.RIGHT) {
                    sprite = this.#spriteSheetGeneral.getAnimation(`dino-${character}-walking-right-loop`).getCurrentFrame();
                }
                else if (state === PlayerState.WALKING && direction === directions.UP) {
                    sprite = this.#spriteSheetGeneral.getAnimation(`dino-${character}-walking-up-loop`).getCurrentFrame();
                }
                else {
                    sprite = this.#spriteSheetGeneral.getAnimation(`dino-${character}-idle-${direction.toLowerCase()}-loop`).getCurrentFrame()
                }

                if (sprite) {
                    this.#context.fill();
                    let x = player.getPosition().x - sprite.frame.w / 2;
                    let y = player.getPosition().y - sprite.frame.h + 28;
                    let playerSpriteParams = [this.#spriteSheetGeneral.getImage(),
                    sprite.frame.x,
                    sprite.frame.y,
                    sprite.frame.w,
                    sprite.frame.h,
                        x,
                        y,
                    sprite.frame.w,
                    sprite.frame.h];

                    this.#drawQueue.push(new Drawable('image', playerSpriteParams, player.getPosition().y));
                }
                // let drawParams = [
                //     coordinate.x * 100,
                //     coordinate.y * 100,
                //     100,
                //     100
                // ]

                // this.#drawQueue.push(new Drawable('rect', drawParams, 2000, 'yellow'));
            }
        })

    }

    drawDebug(grid, size) {
        let coordinate, drawParams, textParams;

        grid.forEach(index => {
            coordinate = Grid.convertIndexToCoordinate(index);

            drawParams = [
                coordinate.x,
                coordinate.y,
                coordinate.x * size,
                coordinate.y * size
            ]

            this.#drawQueue.push(new Drawable('rect', drawParams, 10000, 'rgba(255,0,0,0.25)'));

        });


    }

    draw(deltaTime) {
        this.#spriteSheetGeneral.updateAnimations(deltaTime);
        this.#spriteSheetEnvironment.updateAnimations(deltaTime);
        this.#spriteSheetItems.updateAnimations(deltaTime);

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