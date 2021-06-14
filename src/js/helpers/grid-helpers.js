import { TileState } from "../state/tile-state"
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