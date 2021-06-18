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
import { convertCoordinateToIndex, convertIndexToCoordinate, getNeighbours, isCliffBottom, isCliffCornerBottomLeft, isCliffCornerBottomRight, isCliffCornerTopLeft, isCliffCornerTopRight, isCliffRight, isCliffTop, isOceanCornerBottomLeft, isOceanCornerBottomRight, isOceanCornerTopLeft, isOceanCornerTopRight, shouldDrawEmptyTile } from "../helpers/grid-helpers";
import { Anchors } from "../helpers/anchor";
import Vector from "../structures/vector";
import { AnimationManager } from "../game-management/animation-manager";
import Animation from "../helpers/animation";
import { ItemsState } from "../state/item";

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
    #previousTiles;
    #currentTiles;
    #previousItems;
    #currentItems;
    #animationManager;
    #elevationMultiplier;
    #previousBombs;
    #currentBombs;
    #rubble;
    #scorches;

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
        this.#previousTiles = [];
        this.#currentTiles = [];
        this.#previousItems = [];
        this.#currentItems = [];
        this.#previousBombs = [];
        this.#currentBombs = [];
        this.#animationManager = new AnimationManager();
        this.#elevationMultiplier = 10;
        this.#rubble = [];
        this.#scorches = [];
    }

    clear() {
        this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    drawImageTile({ queue, image, sprite, coordinate, size, anchor = Anchors.CENTER, zIndex, useSpriteDimensions = false, width = 100, height = 100, yOffset = 0, xOffset = 0, isDebugMode }) {

        width = useSpriteDimensions ? sprite.frame.w : width;
        height = useSpriteDimensions ? sprite.frame.h : height;
        zIndex = zIndex || coordinate.y * size;



        if (anchor === Anchors.CENTER) {
            xOffset = xOffset + (width - size) / 2;
            yOffset = yOffset + (height - size) / 2;
        }

        if (anchor === Anchors.BOTTOM) {
            xOffset = xOffset + (width - size) / 2;
            yOffset = yOffset + (height - size);
        }

        if (anchor === Anchors.TOP) {
            xOffset = xOffset + (width - size) / 2;
        }

        if (anchor === Anchors.CENTER_BOTTOM) {
            xOffset = xOffset + (width - size) / 2;
            yOffset = yOffset + (height - size) + (size / 2);
            zIndex += yOffset
        }

        let drawParams = [
            image,
            sprite.frame.x,
            sprite.frame.y,
            sprite.frame.w,
            sprite.frame.h,
            coordinate.x * size - xOffset,
            coordinate.y * size - yOffset,
            width,
            height];

        queue.push(new Drawable('image', drawParams, zIndex));


        if (isDebugMode) {

            let rectParams = [
                coordinate.x * size - xOffset,
                coordinate.y * size - yOffset,
                width,
                height
            ];
            this.#drawQueue.push(new Drawable('rect', rectParams, 10000000, '', 'magenta'));
        }
    }

    drawBasicTile(coordinate, index, elevation, elevationMap) {
        const image = this.#spriteSheetEnvironment.getImage();

        let sprite = this.#spriteSheetEnvironment.getRandomFrame('tile-grass-random', index);
        const neighbours = getNeighbours(index, 1, this.#columnCount, this.#rowCount);

        let zIndex = coordinate.y * this.#cellSize - this.#cellSize + (elevation * this.#elevationMultiplier);

        this.drawImageTile({
            queue: this.#drawQueue,
            image,
            sprite,
            coordinate,
            size: this.#cellSize,
            zIndex,
        });
    }

    drawBasicSolidBlock(coordinate, elevation) {
        const sprite = this.#spriteSheetEnvironment.getAnimation('indestructable-terrain').getCurrentFrame();
        const image = this.#spriteSheetEnvironment.getImage();
        const zIndex = coordinate.y * this.#cellSize - this.#cellSize + (elevation * this.#elevationMultiplier) + 200;
        this.drawImageTile({
            queue: this.#drawQueue,
            image,
            sprite,
            coordinate,
            anchor: Anchors.BOTTOM,
            size: this.#cellSize,
            zIndex,
            useSpriteDimensions: true,
            isDebugMode: false
        });
    }

    drawOcean(grid, index, coordinate, elevation) {
        let color = '#6ebcd2';
        const zIndex = coordinate.y * this.#cellSize - this.#cellSize + (elevation * this.#elevationMultiplier);
        let image = this.#spriteSheetEnvironment.getImage()
        let drawParams = [
            coordinate.x * this.#cellSize + this.#borderWidth,
            coordinate.y * this.#cellSize + this.#borderWidth,
            this.#cellSize,
            this.#cellSize
        ];
        let sprite;

        let neighbours = getNeighbours(index, 1, this.#columnCount, this.#rowCount);

        this.#drawQueue.push(new Drawable('rect', drawParams, 0, color));


        if (neighbours[directions.UP].length > 0 && grid[neighbours[directions.UP][0]] !== TileState.RESTRICTED) {
            sprite = this.#spriteSheetEnvironment.getRandomFrame('grass-edge-down-random', index);
            this.drawImageTile({ queue: this.#drawQueue, image, sprite, coordinate, size: this.#cellSize, zIndex });
        }

        if (neighbours[directions.DOWN].length > 0 && grid[neighbours[directions.DOWN][0]] !== TileState.RESTRICTED) {
            sprite = this.#spriteSheetEnvironment.getRandomFrame('grass-edge-up-random', index);
            this.drawImageTile({ queue: this.#drawQueue, image, sprite, coordinate, size: this.#cellSize, zIndex });
        }

        if (neighbours[directions.RIGHT].length > 0 && grid[neighbours[directions.RIGHT][0]] !== TileState.RESTRICTED) {
            sprite = this.#spriteSheetEnvironment.getRandomFrame('grass-edge-left-random', index);
            this.drawImageTile({ queue: this.#drawQueue, image, sprite, coordinate, size: this.#cellSize, zIndex });
        }

        if (neighbours[directions.LEFT].length > 0 && grid[neighbours[directions.LEFT][0]] !== TileState.RESTRICTED) {
            sprite = this.#spriteSheetEnvironment.getRandomFrame('grass-edge-right-random', index);
            this.drawImageTile({ queue: this.#drawQueue, image, sprite, coordinate, size: this.#cellSize, zIndex });
        }

        if (isOceanCornerBottomLeft(grid, neighbours)) {
            sprite = this.#spriteSheetEnvironment.getRandomFrame('grass-edge-leftdown-random', index);
            this.drawImageTile({ queue: this.#drawQueue, image, sprite, coordinate, size: this.#cellSize, zIndex });
        }

        if (isOceanCornerBottomRight(grid, neighbours)) {
            sprite = this.#spriteSheetEnvironment.getRandomFrame('grass-edge-rightdown-random', index);
            this.drawImageTile({ queue: this.#drawQueue, image, sprite, coordinate, size: this.#cellSize, zIndex });
        }

        if (isOceanCornerTopLeft(grid, neighbours)) {
            sprite = this.#spriteSheetEnvironment.getRandomFrame('grass-edge-leftup-random', index);
            this.drawImageTile({ queue: this.#drawQueue, image, sprite, coordinate, size: this.#cellSize, zIndex });
        }

        if (isOceanCornerTopRight(grid, neighbours)) {
            sprite = this.#spriteSheetEnvironment.getRandomFrame('grass-edge-rightup-random', index);
            this.drawImageTile({ queue: this.#drawQueue, image, sprite, coordinate, size: this.#cellSize, zIndex });
        }

    }

    drawBasicBlock(coordinate, index, elevation) {
        const sprite = this.#spriteSheetEnvironment.getRandomFrame('destructable-rock-random', index);
        const image = this.#spriteSheetEnvironment.getImage();
        const zIndex = coordinate.y * this.#cellSize - this.#cellSize + (elevation * this.#elevationMultiplier);
        this.drawImageTile({
            queue: this.#drawQueue,
            image,
            sprite,
            coordinate,
            anchor: Anchors.UP,
            size: this.#cellSize,
            zIndex,
            useSpriteDimensions: true,
            isDebugMode: false

        });
    }

    drawRubble(coordinate, elevation) {
        const sprite = this.#spriteSheetEnvironment.getAnimation('rock-rubble').getCurrentFrame();
        const zIndex = coordinate.y * this.#cellSize - this.#cellSize + (elevation * this.#elevationMultiplier);
        const image = this.#spriteSheetEnvironment.getImage();
        this.drawImageTile({
            queue: this.#drawQueue,
            image,
            sprite,
            coordinate,
            size: this.#cellSize,
            zIndex
        });
    }

    drawScorch(coordinate, elevation) {
        let sprite = this.#spriteSheetEnvironment.getAnimation('scorched-terrain').getCurrentFrame();
        const zIndex = coordinate.y * this.#cellSize - this.#cellSize + (elevation * this.#elevationMultiplier) + 20;
        const image = this.#spriteSheetEnvironment.getImage();
        this.drawImageTile({
            queue: this.#drawQueue,
            image,
            sprite,
            coordinate,
            size: this.#cellSize,
            zIndex
        });
    }

    drawShadow(coordinate, elevation) {
        let sprite = this.#spriteSheetEnvironment.getAnimation('shadow-indestructable').getCurrentFrame();
        const zIndex = coordinate.y * this.#cellSize - this.#cellSize + (elevation * this.#elevationMultiplier) + 10;
        let playerSpriteParams = [this.#spriteSheetEnvironment.getImage(),
        sprite.frame.x,
        sprite.frame.y,
        sprite.frame.w,
        sprite.frame.h,
        coordinate.x * this.#cellSize + (this.#cellSize / 2) - (sprite.frame.w / 2) + 10,
        coordinate.y * this.#cellSize + this.#cellSize - sprite.frame.h - 10,
        sprite.frame.w,
        sprite.frame.h];

        this.#drawQueue.push(new Drawable('image', playerSpriteParams, zIndex));
    }

    drawStairs(coordinate, index, elevation) {
        const sprite = this.#spriteSheetEnvironment.getAnimation('stairs-bottom').getCurrentFrame();
        const zIndex = coordinate.y * this.#cellSize - this.#cellSize + (elevation * this.#elevationMultiplier);
        const image = this.#spriteSheetEnvironment.getImage();
        this.drawImageTile({
            queue: this.#drawQueue,
            image,
            sprite,
            coordinate,
            size: this.#cellSize,
            zIndex
        });
    }

    drawTar(coordinate, index, elevation) {
        const sprite = this.#spriteSheetEnvironment.getAnimation('swamp-middle').getCurrentFrame();
        const zIndex = coordinate.y * this.#cellSize - this.#cellSize + (elevation * this.#elevationMultiplier);
        const image = this.#spriteSheetEnvironment.getImage();
        this.drawImageTile({
            queue: this.#drawQueue,
            image,
            sprite,
            coordinate,
            size: this.#cellSize,
            zIndex
        });
    }

    drawGravestone(coordinate, index, deltaTime, elevation) {
        let animation;
        const image = this.#spriteSheetItems.getImage();
        const zIndex = coordinate.y * this.#cellSize - this.#cellSize + (elevation * this.#elevationMultiplier);

        if (this.#previousItems[index] !== this.#currentItems[index]) {
            const frames = this.#spriteSheetItems.getAnimationFrames('grave-appear');
            animation = new Animation('grave-appear', frames, 1000 / 24, false, 2000);
            this.#animationManager.add(index, image, animation);
        }

        animation = this.#animationManager.get(index);
        const animationImage = this.#animationManager.getImage(index);

        if (animation) {
            animation.update(deltaTime);

            const sprite = this.#animationManager.get(index).getCurrentFrame();

            if (sprite) {
                let x = coordinate.x * this.#cellSize - (sprite.frame.w / 2) + (this.#cellSize / 2);
                let y = coordinate.y * this.#cellSize - (sprite.frame.h / 2) + (this.#cellSize / 2) - (this.#cellSize);
                this.drawImageTile({
                    queue: this.#drawQueue,
                    image: animationImage,
                    sprite,
                    coordinate,
                    size: this.#cellSize,
                    useSpriteDimensions: true,
                    anchor: Anchors.CENTER_BOTTOM,
                    yOffset: -20,
                    isDebugMode: false,
                    zIndex
                });
            }
        }
        // const debugDrawParams = [
        //     x,
        //     y,
        //     sprite.frame.w,
        //     sprite.frame.h
        // ]



        // this.#drawQueue.push(new Drawable('rect', debugDrawParams, 10000, false, 'red'));
    }

    drawCliff(coordinate, index, direction, elevation) {
        const sprite = this.#spriteSheetEnvironment.getRandomFrame(`grass-edge-${direction.toString().toLowerCase()}-random`, index);
        const zIndex = coordinate.y * this.#cellSize - this.#cellSize + (elevation * this.#elevationMultiplier);
        let yOffset = direction === directions.DOWN ? 0 : elevation * 200;

        if (sprite) {
            const image = this.#spriteSheetEnvironment.getImage();
            this.drawImageTile({
                queue: this.#drawQueue,
                image,
                sprite,
                coordinate,
                size: this.#cellSize,
                zIndex
            });
        }
    }

    drawFern(coordinate, elevation) {
        const sprite = this.#spriteSheetEnvironment.getAnimation('plant-fern-large-back').getCurrentFrame();
        const sprite2 = this.#spriteSheetEnvironment.getAnimation('plant-fern-large-front').getCurrentFrame();
        const image = this.#spriteSheetEnvironment.getImage();
        const zIndex = coordinate.y * this.#cellSize - this.#cellSize + (elevation * this.#elevationMultiplier);

        this.drawImageTile({
            queue: this.#drawQueue,
            image,
            sprite,
            coordinate,
            size: this.#cellSize,
            width: sprite.frame.w,
            height: sprite.frame.h,
            useSpriteDimensions: true,
            zIndex: zIndex
        });

        this.drawImageTile({
            queue: this.#drawQueue,
            image,
            sprite: sprite2,
            coordinate,
            size: this.#cellSize,
            width: sprite.frame.w,
            height: sprite.frame.h,
            useSpriteDimensions: true,
            zIndex: zIndex + 200,
            isDebugMode: false
        });
    }

    drawBombs(bombs, player, players, elevationMap, logger) {
        let coordinate, elevation;
        bombs.forEach(bomb => {
            elevation = elevationMap[bomb.id];
            coordinate = convertIndexToCoordinate(bomb.id, this.#columnCount, this.#rowCount);
            this.drawBomb(coordinate, bomb, player, players, elevation);

            if (!this.#previousBombs.includes(bomb.id) && !this.#currentBombs.includes(bomb.id)) {
                this.#currentBombs.push(bomb.id);
            }
        });

        for (var i = this.#currentBombs.length - 1; i >= 0; i--) {
            if (!bombs.find(bomb => bomb.id === this.#currentBombs[i])) {
                this.#scorches.push(this.#currentBombs[i]);
                this.#currentBombs.splice(i, 1);
            }
        }

        this.#previousBombs = this.#currentBombs;
    }

    drawBomb(coordinate, bomb, player, players, elevation) {
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
            const zIndex = coordinate.y * this.#cellSize + (elevation * this.#elevationMultiplier);
            const image = this.#spriteSheetItems.getImage();

            if (sprite) {

                this.drawImageTile({
                    queue: this.#drawQueue,
                    image,
                    sprite,
                    coordinate,
                    anchor: Anchors.CENTER_BOTTOM,
                    size: this.#cellSize,
                    zIndex,
                    useSpriteDimensions: true,
                    isDebugMode: false,
                    yOffset: -20
                });
            }
        }
    }

    drawBlasts(blasts, elevationMap) {
        let coordinate, elevation;
        blasts.forEach(blast => {
            elevation = elevationMap[blast.id];
            coordinate = convertIndexToCoordinate(blast.id, this.#columnCount, this.#rowCount);
            this.drawExplosion(coordinate, blast, elevation);
        })

    }

    drawExplosion(coordinate, blast, elevation) {
        if (blast) {
            let sprite = this.#spriteSheetItems.getAnimation('explosion-center').getFrameAtProgress(blast.progress)
            const zIndex = coordinate.y * this.#cellSize - this.#cellSize + (elevation * this.#elevationMultiplier) + 1000;
            const image = this.#spriteSheetItems.getImage();

            if (sprite) {
                this.drawImageTile({
                    queue: this.#drawQueue,
                    image,
                    sprite,
                    coordinate,
                    size: this.#cellSize,
                    zIndex
                });
            }
        }
    }

    drawItems(itemsGrid, elevationMap, deltaTime) {
        this.#currentItems = itemsGrid;
        let coordinate, elevation;

        itemsGrid.forEach((element, index) => {
            elevation = elevationMap[index];

            coordinate = convertIndexToCoordinate(index, 15, 15);

            if (element === ItemsState.GRAVE) {
                this.drawGravestone(coordinate, index, deltaTime, elevation);
            }
        })

        this.#previousItems = [...this.#currentItems];
    }



    drawGrid(grid, elevationMap, config, bombs, blasts) {
        this.#currentTiles = grid;

        let coordinate, bomb, bombsByIndex, blast, blastsByIndex, elevation;

        this.#currentTiles.forEach((element, index) => {
            elevation = elevationMap[index];

            coordinate = convertIndexToCoordinate(index, 15, 15);

            bombsByIndex = bombs.filter((bomb) => bomb.id == index);
            bomb = bombsByIndex.length > 0 ? bombsByIndex[0] : null;

            blastsByIndex = blasts.filter((blast) => blast.id === index);
            blast = blastsByIndex.length > 0 ? blastsByIndex[0] : null;


            if (shouldDrawEmptyTile(element)) {
                this.drawBasicTile(coordinate, index, elevation, elevationMap);
            }




            //DRAW TILES


            if (element === TileState.INDESTRUCTIBLE) {
                this.drawShadow(coordinate, elevation);
                this.drawBasicSolidBlock(coordinate, elevation);
            }
            else if (element === TileState.RESTRICTED) {
                this.drawOcean(grid, index, coordinate, elevation);
            }
            else if (element === TileState.DESTRUCTABLE) {
                this.drawBasicTile(coordinate, index, elevation, elevationMap);
                this.drawBasicBlock(coordinate, index, elevation);
            }
            else if (element === TileState.STAIRS) {
                this.drawStairs(coordinate, index, elevation);
            }
            else if (element === TileState.SLOW) {
                this.drawTar(coordinate, index, elevation);
            }

            if (this.#previousTiles[index] === TileState.DESTRUCTABLE && this.#currentTiles[index] !== TileState.DESTRUCTABLE) {
                this.#rubble.push(index);
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

        this.#rubble.forEach(rubble => {
            let coordinate = convertIndexToCoordinate(rubble, 15, 15);
            this.drawRubble(coordinate, elevationMap[rubble])
        })

        this.#scorches.forEach(scorch => {
            let coordinate = convertIndexToCoordinate(scorch, 15, 15);
            this.drawScorch(coordinate, elevationMap[scorch])
        })


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
                if (Number.isInteger(elevationMap[index])) {
                    let coordinate = convertIndexToCoordinate(index, 15, 15);
                    this.#plants.push(coordinate);
                }
            })
        }

        this.#plants.forEach(plant => this.drawFern(plant, elevation));
        this.#previousTiles = [...this.#currentTiles];
    }

    drawPlayers(players, elevationMap) {
        let elevation, coordinate;

        players.forEach(player => {
            coordinate = Vector.multiplyScalar(player.getPosition(), 1 / 100).floor();
            let playerIndex = convertCoordinateToIndex(coordinate.x, coordinate.y, 15, 15);
            elevation = elevationMap[playerIndex];

            let state = player.getState();
            let direction = player.getDirection();

            this.#currentTime = performance.now();
            this.#deltaTime = this.#currentTime - this.#previousTime;
            this.#previousTime = this.#currentTime;
            let character = characterNames[player.getCharacterIndex()] || 'rex';

            if (player && direction && state) {
                let sprite;
                const zIndex = coordinate.y * this.#cellSize - this.#cellSize + (elevation * this.#elevationMultiplier) + 200;
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

                    this.#drawQueue.push(new Drawable('image', playerSpriteParams, zIndex));
                }
            }
        })
    }

    drawDebug(grid, items, size, players, config, logger) {
        let coordinate, drawParams, elevationIdParams, colliderParams, bombPlacementParams;
        grid.forEach((element, index) => {
            coordinate = convertIndexToCoordinate(index, 15, 15);

            elevationIdParams = [
                config.elevation[index].toString(),
                coordinate.x * size + 4,
                coordinate.y * size + size - 4
            ];

            this.#drawQueue.push(new Drawable('text', elevationIdParams, 10000, '#2e2e2e'));
            // this.#drawQueue.push(new Drawable('rect', drawParams, 10000, 'rgba(255,0,0,0.25)'));
        });

        // logger.log(items);

        items.forEach((element, index) => {
            coordinate = convertIndexToCoordinate(index, 15, 15);

            let textItemIdParams = [
                items[index].toString(),
                coordinate.x * size + size / 2,
                coordinate.y * size + size - 30
            ]

            this.#drawQueue.push(new Drawable('text', textItemIdParams, 10000, 'blue'));
        })

        players.forEach(player => {
            let playerPosition = Vector.multiplyScalar(player.getPosition(), 1 / 100).floor();
            let bombPlacementPosition = Vector.multiplyScalar(player.getBombPosition(), 1 / 100).floor();


            drawParams = [
                playerPosition.x * size + 5,
                playerPosition.y * size + 5,
                size - 10,
                size - 10
            ];

            colliderParams = [
                player.getBounds().topLeft.x,
                player.getBounds().topLeft.y,
                player.getBounds().topRight.x - player.getBounds().topLeft.x,
                player.getBounds().bottomLeft.y - player.getBounds().topLeft.y
            ];

            bombPlacementParams = [
                bombPlacementPosition.x * size + 15,
                bombPlacementPosition.y * size + 15,
                size - 30,
                size - 30
            ];


            this.#drawQueue.push(new Drawable('rect', drawParams, 10000, null, 'red'));
            this.#drawQueue.push(new Drawable('rect', bombPlacementParams, 10000, null, 'white'));
            this.#drawQueue.push(new Drawable('rect', colliderParams, 10000, null, 'magenta'));
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