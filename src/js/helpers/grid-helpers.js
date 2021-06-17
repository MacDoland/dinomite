import { TileState } from "../state/tile-state"
import Grid from "../structures/grid";
import Vector from "../structures/vector";
import directions from "./direction"


export const isCliffBottom = (grid, tiles, currentElevation, elevationMap) => {
    return tiles[directions.UP].length > 0
        && elevationMap[tiles[directions.UP][0]] > currentElevation
        && grid[tiles[directions.UP][0]] !== TileState.STAIRS
}

export const isCliffTop = (grid, tiles, currentElevation, elevationMap) => {
    return tiles[directions.DOWN].length > 0
        && elevationMap[tiles[directions.DOWN][0]] > currentElevation
        && grid[tiles[directions.DOWN][0]] !== TileState.STAIRS
        && Number.isInteger(elevationMap[tiles[directions.DOWN][0]])
}


export const isCliffRight = (grid, tiles, currentElevation, elevationMap) => {
    return tiles[directions.LEFT].length > 0
    && elevationMap[tiles[directions.LEFT][0]] > currentElevation
    && grid[tiles[directions.LEFT][0]] !== TileState.STAIRS
    && Number.isInteger(elevationMap[tiles[directions.LEFT][0]])
}

export const isCliffLeft = (grid, tiles, currentElevation, elevationMap) => {
    return tiles[directions.DOWN].length > 0
        && tiles[directions.RIGHT].length > 0
        && grid[tiles[directions.DOWN][0]] === TileState.CLIFF_LEFT
        && (grid[tiles[directions.RIGHT][0]] === TileState.CLIFF_UP || grid[tiles[directions.LEFT][0]] === TileState.STAIRS)
}



export const isCliffCornerBottomLeft = (grid, tiles) => {
    return tiles[directions.UP].length > 0
        && tiles[directions.RIGHT].length > 0
        && grid[tiles[directions.UP][0]] === TileState.CLIFF_LEFT
        && (grid[tiles[directions.RIGHT][0]] === TileState.CLIFF_DOWN || grid[tiles[directions.LEFT][0]] === TileState.STAIRS)
}

export const isCliffCornerBottomRight = (grid, tiles) => {
    return tiles[directions.UP].length > 0
        && tiles[directions.LEFT].length > 0
        && grid[tiles[directions.UP][0]] === TileState.CLIFF_RIGHT
        && (grid[tiles[directions.LEFT][0]] === TileState.CLIFF_DOWN || grid[tiles[directions.LEFT][0]] === TileState.STAIRS)
}

export const isCliffCornerTopLeft = (grid, tiles) => {
    return tiles[directions.DOWN].length > 0
        && tiles[directions.RIGHT].length > 0
        && grid[tiles[directions.DOWN][0]] === TileState.CLIFF_LEFT
        && (grid[tiles[directions.RIGHT][0]] === TileState.CLIFF_UP || grid[tiles[directions.LEFT][0]] === TileState.STAIRS)
}

export const isCliffCornerTopRight = (grid, tiles) => {
    return tiles[directions.DOWN].length > 0
        && tiles[directions.LEFT].length > 0
        && grid[tiles[directions.DOWN][0]] === TileState.CLIFF_RIGHT
        && (grid[tiles[directions.LEFT][0]] === TileState.CLIFF_UP || grid[tiles[directions.LEFT][0]] === TileState.STAIRS)
}


export const isOceanCornerBottomRight = (grid, tiles) => {
    return tiles[directions.UP].length > 0
        && tiles[directions.LEFT].length > 0
        && grid[tiles[directions.UP][0]] === TileState.RESTRICTED
        && grid[tiles[directions.LEFT][0]] === TileState.RESTRICTED
        && grid[tiles[directions.LEFTUP][0]] !== TileState.RESTRICTED;
}

export const isOceanCornerBottomLeft = (grid, tiles) => {
    return tiles[directions.UP].length > 0
        && tiles[directions.RIGHT].length > 0
        && grid[tiles[directions.UP][0]] === TileState.RESTRICTED
        && grid[tiles[directions.RIGHT][0]] === TileState.RESTRICTED
        && grid[tiles[directions.RIGHTUP][0]] !== TileState.RESTRICTED;
}

export const isOceanCornerTopRight = (grid, tiles) => {
    return tiles[directions.DOWN].length > 0
        && tiles[directions.LEFT].length > 0
        && grid[tiles[directions.DOWN][0]] === TileState.RESTRICTED
        && grid[tiles[directions.LEFT][0]] === TileState.RESTRICTED
        && grid[tiles[directions.LEFTDOWN][0]] !== TileState.RESTRICTED;
}

export const isOceanCornerTopLeft = (grid, tiles) => {
    return tiles[directions.DOWN].length > 0
        && tiles[directions.RIGHT].length > 0
        && grid[tiles[directions.DOWN][0]] === TileState.RESTRICTED
        && grid[tiles[directions.RIGHT][0]] === TileState.RESTRICTED
        && grid[tiles[directions.RIGHTDOWN][0]] !== TileState.RESTRICTED;
}

export const isBlockingTile = (tile) => {
    return tile === TileState.INDESTRUCTIBLE
        || tile === TileState.RESTRICTED
        || tile === TileState.CLIFF
}

export const isTileThatStopsExplosion = (tile) => {
    return tile === TileState.DESTRUCTABLE
        || tile === TileState.GRAVESTONE
        || tile === TileState.GRAVESTONE_RUBBLE
        || tile === TileState.GRAVESTONE_SORCH
        || tile === TileState.GRAVESTONE_STAIRS
        || tile === TileState.GRAVESTONE_TAR
        || tile === TileState.INDESTRUCTIBLE
        || tile === TileState.CLIFF
        || tile === TileState.CLIFF_DOWN
        || tile === TileState.CLIFF_LEFT
        || tile === TileState.CLIFF_RIGHT
        || tile === TileState.CLIFF_UP
        || tile === TileState.RESTRICTED
}

export const isPlayerBlockingTile = (tile) => {
    return tile === TileState.INDESTRUCTIBLE
        || tile === TileState.RESTRICTED
        || tile === TileState.CLIFF_DOWN
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

