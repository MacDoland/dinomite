import { TileState } from "../state/tile-state"
import Grid from "../structures/grid";
import Vector from "../structures/vector";
import directions from "./direction"

export const isOceanCornerBottomRight = (grid, tiles) => {
    return tiles[directions.UP].length > 0
        && tiles[directions.LEFT].length > 0
        && grid[tiles[directions.UP][0]] === TileState.OCEAN
        && grid[tiles[directions.LEFT][0]] === TileState.OCEAN
        && grid[tiles[directions.LEFTUP][0]] !== TileState.OCEAN;
}

export const isOceanCornerBottomLeft = (grid, tiles) => {
    return tiles[directions.UP].length > 0
        && tiles[directions.RIGHT].length > 0
        && grid[tiles[directions.UP][0]] === TileState.OCEAN
        && grid[tiles[directions.RIGHT][0]] === TileState.OCEAN
        && grid[tiles[directions.RIGHTUP][0]] !== TileState.OCEAN;
}

export const isOceanCornerTopRight = (grid, tiles) => {
    return tiles[directions.DOWN].length > 0
        && tiles[directions.LEFT].length > 0
        && grid[tiles[directions.DOWN][0]] === TileState.OCEAN
        && grid[tiles[directions.LEFT][0]] === TileState.OCEAN
        && grid[tiles[directions.LEFTDOWN][0]] !== TileState.OCEAN;
}

export const isOceanCornerTopLeft = (grid, tiles) => {
    return tiles[directions.DOWN].length > 0
        && tiles[directions.RIGHT].length > 0
        && grid[tiles[directions.DOWN][0]] === TileState.OCEAN
        && grid[tiles[directions.RIGHT][0]] === TileState.OCEAN
        && grid[tiles[directions.RIGHTDOWN][0]] !== TileState.OCEAN;
}

export const isBlockingTile = (tile) => {
    return tile === TileState.INDESTRUCTIBLE 
    || tile === TileState.OCEAN 
    || tile === TileState.CLIFF
}

export const isDestructableTile = (tile) => {
    return tile === TileState.DESTRUCTIBLE 
    || tile === TileState.GRAVESTONE
    || tile === TileState.GRAVESTONE_RUBBLE
    || tile === TileState.GRAVESTONE_SORCH
    || tile === TileState.GRAVESTONE_STAIRS
    || tile === TileState.GRAVESTONE_TAR
}

export const isPlayerBlockingTile = (tile) => {
    return tile === TileState.INDESTRUCTIBLE 
    || tile === TileState.OCEAN 
    || tile === TileState.CLIFF 
    || tile === TileState.DESTRUCTABLE
    || tile === TileState.BOMB
    || tile === TileState.BOMB_RUBBLE
    || tile === TileState.BOMB_RUBBLE_SCORCH
    || tile === TileState.BOMB_SCORCH
    || tile === TileState.TAR_BOMB
    || tile === TileState.STAIRS_BOMB
    || tile === TileState.GRAVESTONE
    || tile === TileState.GRAVESTONE_RUBBLE
    || tile === TileState.GRAVESTONE_SORCH
    || tile === TileState.GRAVESTONE_STAIRS
    || tile === TileState.GRAVESTONE_TAR
}

export const getPlayersOnTile = (tileId, players, gridColumnCount, gridRowCount) => {
    return players.filter(player => {
        let playerGridPosition = Vector.multiplyScalar(player.getPosition(), 1 / 100).floor();
        let playerIndex = Grid.convertCoordinateToIndex(playerGridPosition.x, playerGridPosition.y, gridColumnCount, gridRowCount);
        return playerIndex === tileId;
    });
}
