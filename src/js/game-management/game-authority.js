import { processPlayerMovement } from "../helpers/referee";
import Player from "../player";
import Vector from "../structures/vector";
import stateManager, { StateEvents } from "./state-manager";
import Timer from "../helpers/timer";
import BombShop from "./bomb-shop";
import Grid from "../structures/grid";
import { indexToTileState, TileState } from "../state/tile-state";
import directions from "../helpers/direction";
import { nanoid } from "nanoid";

class GameAuthority {
    players;
    #grid;
    #deltaTime;
    #gameConfig;
    #timer;
    #bombShop;

    #playerMovementUpdates;

    constructor(grid, gameConfig) {
        this.#timer = new Timer(true);
        this.#grid = grid;
        this.#gameConfig = gameConfig;
        this.players = {};
        this.inputs = [];
        let prev = 0;
        this.#deltaTime = 0;
        let now;
        this.#playerMovementUpdates = {};
        this.#bombShop = new BombShop();

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
                    targets = targets.concat(this.getExplosionTargets(tiles));
                });

            this.#bombShop.createExplosion(index, 30, 800);

            targets.forEach((target) => {
                this.#bombShop.createExplosion(target, 30, 800);

                // [this.#player].forEach(player => {
                //     let playerGridPosition = Vector.multiplyScalar(player.getPosition(), 1 / 100).floor();
                //     let playerIndex = Grid.convertCoordinateToIndex(playerGridPosition.x, playerGridPosition.y, this.#grid.getColumnCount(), this.#grid.getRowCount());
                //     if (target === playerIndex) {
                //         player.die();
                //     }
                // });
            });

        });

        this.#bombShop.onExplosion((index) => {
            //this.#audioManager.play('boom');
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
            if (!this.#bombShop.hasActiveBlastAt(index)) {
                const currentState = indexToTileState(this.#grid.getElementAt(index));

                if (currentState >= 0) {
                    const newState = parseInt(stateManager.transition(currentState.toString(), StateEvents.EXPLOSION_END).value);
                    this.#grid.set(index, newState);
                }
            }
        });

        const loop = () => {
            now = new Date();
            this.#deltaTime = (now - prev) / 1000;


            Object.keys(this.#playerMovementUpdates).forEach(key => {
                if (this.#playerMovementUpdates[key]) {
                    const input = this.#playerMovementUpdates[key];

                    if (input) {
                        this.processPlayerInput(key, input);
                        this.#playerMovementUpdates[key] = null;
                    }
                }
            })

            prev = now;
        }

        this.#timer.onElapsed(loop);
        this.#timer.start(1000 / 60)

        setTimeout(loop, 0);
    }

    addPlayer(id, characterId) {
        if (!this.players[id]) {
            this.players[id] = new Player(id, characterId, 48);
            let startIndex = Object.keys(this.players).length === 1 ? this.#gameConfig.startPlayerOne : this.#gameConfig.startPlayerTwo;
            this.players[id].setPosition(this.#grid.getCellCenter(startIndex, this.#gameConfig.cellSize));
        }

        return this.players[id];
    }

    removePlayer(id) {
        if (this.players[id]) {
            this.players[id] = null;
        }
    }

    plantBomb(playerId, tileId) {
        //TODO check here if player can drop bombs
        this.#bombShop.plant(tileId);
    }

    getExplosionTargets(tiles) {
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

    getFullGameState() {
        return {
            players: Object.keys(this.players).filter(key => this.players[key]).map((key) => {
                const player = this.players[key];
                return {
                    id: player.getId(),
                    position: player.getPosition().raw(),
                    state: player.getState(),
                    direction: player.getDirection(),
                    characterId: player.getCharacterIndex()
                }
            }),
            grid: this.#grid.getGrid(),
            bombs: this.#bombShop.getActiveBombs().map(bomb => {
                return {
                    id: bomb.getIndex(),
                    progress: bomb.getProgress(),
                    state: bomb.getState()
                };
            }),
            blasts: this.#bombShop.getActiveBlasts().map(blast => {
                return {
                    id: blast.getIndex(),
                    progress: blast.getProgress()
                };
            })
        }
    }

    getUpdate() {
        return {
            players: Object.keys(this.players).filter(key => this.players[key]).map((key) => {
                const player = this.players[key];
                return {
                    id: player.getId(),
                    position: player.getPosition().raw(),
                    state: player.getState(),
                    direction: player.getDirection(),
                }
            }),
            tiles: this.#grid.flushHistory(),
            bombs: this.#bombShop.getActiveBombs().map(bomb => {
                return {
                    id: bomb.getIndex(),
                    progress: bomb.getProgress(),
                    state: bomb.getState()
                };
            }),
            blasts: this.#bombShop.getActiveBlasts().map(blast => {
                return {
                    id: blast.getIndex(),
                    progress: blast.getProgress()
                };
            })

        }
    }

    addPlayerInputUpdate(id, input) {
        this.#playerMovementUpdates[id] = input;
    }

    processPlayerInput(id, input) {
        const player = this.players[id];

        if (player) {
            const speed = 400;
            let offset = new Vector(0, 0);

            if (input.DOWN) {
                offset.add(new Vector(0, speed * this.#deltaTime));
            }

            if (input.RIGHT) {
                offset.add(new Vector(speed * this.#deltaTime, 0))
            }

            if (input.UP) {
                offset.add(new Vector(0, -speed * this.#deltaTime))
            }

            if (input.LEFT) {
                offset.add(new Vector(-speed * this.#deltaTime, 0))
            }

            if (input.ACTION_UP) {
                let gridCoordinate = Vector.multiplyScalar(player.getPosition(), 1 / 100).floor();
                let playerTile = Grid.convertCoordinateToIndex(gridCoordinate.x, gridCoordinate.y, this.#grid.getColumnCount());
                this.plantBomb(nanoid(), playerTile);
            }

            const result = this.processPlayerMovement(id, player.getBounds(), offset);

            this.players[id].move(result.offset);

            return {
                id,
                position: this.players[id].getPosition(),
                state: this.players[id].getState(),
                direction: this.players[id].getDirection()
            };
        }
    }

    processPlayerMovement(id, bounds, offset) {
        const newPosition = processPlayerMovement(this.#grid, bounds, offset);

        return {
            offset: newPosition,
            id
        }
    }
}

export default GameAuthority;
