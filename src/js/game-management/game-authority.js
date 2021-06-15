import { processPlayerMovement } from "../helpers/referee";
import Player, { PlayerState } from "../player";
import Vector from "../structures/vector";
import stateManager, { StateEvents } from "./state-manager";
import Timer from "../helpers/timer";
import BombShop from "./bomb-shop";
import Grid from "../structures/grid";
import { indexToTileState, TileState } from "../state/tile-state";
import directions from "../helpers/direction";
import { getPlayersOnTile, isBlockingTile, isDestructableTile } from "../helpers/grid-helpers";
import { killPlayersOnTile } from "../helpers/helpers";

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

            targets.push(index);

            targets.forEach((target) => {
                this.#bombShop.createExplosion(target, 30, 800);

                killPlayersOnTile(target, Object.keys(this.players).map(key => this.players[key]), this.#grid);
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

                    const playersOnTile = getPlayersOnTile(index, Object.keys(this.players).map(key => this.players[key]), this.#grid.getColumnCount(), this.#grid.getRowCount());
                    let newState;
                    if (playersOnTile.length === 0) {
                        newState = parseInt(stateManager.transition(currentState.toString(), StateEvents.EXPLOSION_END).value);
                    }
                    else {
                        newState = parseInt(stateManager.transition(currentState.toString(), StateEvents.DEATH).value);
                    }

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

    plantBomb(tileId, playerId) {
        //TODO check here if player can drop bombs
        this.#bombShop.plant(tileId, playerId);
    }

    getExplosionTargets(tiles) {
        let targets = [];
        let hasHitDeadEnd = false;
        let index = 0;
        let targetIndex;

        if (tiles && Array.isArray(tiles)) {

            while (!hasHitDeadEnd && index < tiles.length) {
                targetIndex = tiles[index];
                hasHitDeadEnd = isBlockingTile(this.#grid.getElementAt(targetIndex));
                if (!hasHitDeadEnd && this.#grid.getElementAt(targetIndex) !== TileState.INDESTRUCTIBLE) {
                    targets.push(targetIndex);
                }

                if (isDestructableTile(this.#grid.getElementAt(targetIndex))) {
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
                    characterId: player.getCharacterIndex(),
                    timeOfDeath: player.getTimeOfDeath()
                }
            }),
            grid: this.#grid.getGrid(),
            bombs: this.#bombShop.getActiveBombs().map(bomb => {
                return {
                    id: bomb.getIndex(),
                    onwer: bomb.getOwnerId(),
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
                    timeOfDeath: player.getTimeOfDeath()
                }
            }),
            tiles: this.#grid.flushHistory(),
            bombs: this.#bombShop.getActiveBombs().map(bomb => {
                return {
                    id: bomb.getIndex(),
                    owner: bomb.getOwnerId(),
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
        const position = player.getPosition().multiplyScalar(1 / 100);

        let playerGridPosition = Vector.multiplyScalar(player.getPosition(), 1 / 100).floor();
        let playerIndex = Grid.convertCoordinateToIndex(playerGridPosition.x, playerGridPosition.y, this.#grid.getColumnCount(), this.#grid.getRowCount());
        const currentTileState = this.#grid.getElementAt(playerIndex);

        if (player && player.getState() !== PlayerState.DEATH) {
            const speed = currentTileState === TileState.TAR ? 200 : 400;
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
                this.plantBomb(playerTile, id);
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
