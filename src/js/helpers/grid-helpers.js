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

export const shouldDrawEmptyTile = (tile) => {
    return tile === TileState.EMPTY
    || tile !== TileState.NULL
    && tile !== TileState.RESTRICTED
    && tile !== TileState.SLOW
}

export const isBlockingTile = (tile) => {
    return tile === TileState.INDESTRUCTIBLE
        || tile === TileState.RESTRICTED
        || tile === TileState.CLIFF
}

export const isTileThatStopsExplosion = (tile) => {
    return tile === TileState.DESTRUCTABLE
        || tile === TileState.OBJECT
        || tile === TileState.INDESTRUCTIBLE
        || tile === TileState.CLIFF
        || tile === TileState.RESTRICTED
}

export const isPlayerBlockingTile = (tile) => {
    return tile === TileState.INDESTRUCTIBLE
        || tile === TileState.RESTRICTED
        || tile === TileState.CLIFF
        || tile === TileState.DESTRUCTABLE
        || tile === TileState.OBJECT
}


export const getPlayersOnTile = (tileId, players, gridColumnCount, gridRowCount) => {
    return players.filter(player => {
        let playerGridPosition = Vector.multiplyScalar(player.getPosition(), 1 / 100).floor();
        let playerIndex = convertCoordinateToIndex(playerGridPosition.x, playerGridPosition.y, gridColumnCount, gridRowCount);
        return playerIndex === tileId;
    });
}

export const convertIndexToCoordinate = (index, numberOfColumns, numberOfRows) => {
    return new Vector(index % numberOfColumns, Math.floor(index / numberOfRows));
}

export const convertCoordinateToIndex = (x, y, numberOfColumns) => {
    return (y * numberOfColumns) + x;
}

export const getNeighbours = (index, depth, columnCount, rowCount) => {
    let neighbours = {}, offset;
    let coordinate = convertIndexToCoordinate(index, columnCount, rowCount);

    neighbours[directions.UP] = [];
    neighbours[directions.DOWN] = [];
    neighbours[directions.LEFT] = [];
    neighbours[directions.RIGHT] = [];

    neighbours[directions.LEFTDOWN] = [];
    neighbours[directions.LEFTUP] = [];
    neighbours[directions.RIGHTDOWN] = [];
    neighbours[directions.RIGHTUP] = [];

    for (let i = 0; i < depth; i++) {
        offset = Vector.add(coordinate, new Vector(0, -(i + 1)))
        if (offset.y > 0) {
            neighbours[directions.UP].push(convertCoordinateToIndex(offset.x, offset.y, columnCount));
        }

        offset = Vector.add(coordinate, new Vector(0, (i + 1)))
        if (offset.y < rowCount - 1) {
            neighbours[directions.DOWN].push(convertCoordinateToIndex(offset.x, offset.y, columnCount));
        }

        offset = Vector.add(coordinate, new Vector(-(i + 1), 0))
        if (offset.x > 0) {
            neighbours[directions.LEFT].push(convertCoordinateToIndex(offset.x, offset.y, columnCount));
        }

        offset = Vector.add(coordinate, new Vector((i + 1), 0))
        if (offset.x < columnCount - 1) {
            neighbours[directions.RIGHT].push(convertCoordinateToIndex(offset.x, offset.y, columnCount));
        }



        offset = Vector.add(coordinate, new Vector(-(i + 1), (i + 1)))
        if (offset.y > 0) {
            neighbours[directions.LEFTDOWN].push(convertCoordinateToIndex(offset.x, offset.y, columnCount));
        }

        offset = Vector.add(coordinate, new Vector((i + 1), -(i + 1)))
        if (offset.y < rowCount - 1) {
            neighbours[directions.RIGHTUP].push(convertCoordinateToIndex(offset.x, offset.y, columnCount));
        }

        offset = Vector.add(coordinate, new Vector(-(i + 1), -(i + 1)))
        if (offset.x > 0) {
            neighbours[directions.LEFTUP].push(convertCoordinateToIndex(offset.x, offset.y, columnCount));
        }

        offset = Vector.add(coordinate, new Vector((i + 1), (i + 1)))
        if (offset.x < columnCount - 1) {
            neighbours[directions.RIGHTDOWN].push(convertCoordinateToIndex(offset.x, offset.y, columnCount));
        }

    }

    return neighbours;
}
