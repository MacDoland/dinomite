import { TileState } from "../state/tile-state";
import Vector from "../structures/vector";

export const processPlayerMovement = (grid, bounds, offset) => {
    let newOffset = new Vector();

    if (grid && bounds && offset && (offset.x != 0 || offset.y != 0)) {
        const canMoveTopRightX = canMove(offset.getXOnly(), bounds.topRight, grid);
        const canMoveBottomRightX = canMove(offset.getXOnly(), bounds.bottomRight, grid);
        const canMoveTopLeftX = canMove(offset.getXOnly(), bounds.topLeft, grid);
        const canMoveBottomLeftX = canMove(offset.getXOnly(), bounds.bottomLeft, grid);

        const canMoveTopRightY = canMove(offset.getYOnly(), bounds.topRight, grid);
        const canMoveBottomRightY = canMove(offset.getYOnly(), bounds.bottomRight, grid);
        const canMoveTopLeftY = canMove(offset.getYOnly(), bounds.topLeft, grid);
        const canMoveBottomLeftY = canMove(offset.getYOnly(), bounds.bottomLeft, grid);

        if (canMoveTopRightX && canMoveBottomRightX && canMoveTopLeftX && canMoveBottomLeftX) {
            newOffset.add(offset.getXOnly())
        }

        if (canMoveTopRightY && canMoveBottomRightY && canMoveTopLeftY && canMoveBottomLeftY) {
            newOffset.add(offset.getYOnly())
        }
    }

    return newOffset;
}


export const canMove = (offset, position, grid) => {
    const potentialPosition = Vector.add(position, offset);
    let gridCoordinate = Vector.multiplyScalar(potentialPosition, 1 / 100).floor();
    let index = grid.getIndex(gridCoordinate.x, gridCoordinate.y);
    return index > 0 && index < grid.getGrid().length
        && (grid.getGrid()[index] === TileState.EMPTY
            || grid.getGrid()[index] === TileState.BOMB
            || grid.getGrid()[index] === TileState.RUBBLE
            || grid.getGrid()[index] === TileState.SCORCH
            || grid.getGrid()[index] === TileState.BOMB_RUBBLE_SCORCH
            || grid.getGrid()[index] === TileState.BOMB_SCORCH
            || grid.getGrid()[index] === TileState.BOMB_RUBBLE
            || grid.getGrid()[index] === TileState.RUBBLE_SCORCH
            || grid.getGrid()[index] === TileState.EXPLOSION
            || grid.getGrid()[index] === TileState.EXPLOSION_RUBBLE
            || grid.getGrid()[index] === TileState.EXPLOSION_SCORCH
            || grid.getGrid()[index] === TileState.EXPLOSION_RUBBLE_SCORCH
        );
}