import { TileState } from "../state/tile-state";
import Vector from "../structures/vector";
import { isBlockingTile, isPlayerBlockingTile } from "./grid-helpers";

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
    let currentGridCoordinate = Vector.multiplyScalar(position, 1 / 100).floor();
    let gridCoordinate = Vector.multiplyScalar(potentialPosition, 1 / 100).floor();
    let currentIndex = grid.getIndex(currentGridCoordinate.x, currentGridCoordinate.y);
    let index = grid.getIndex(gridCoordinate.x, gridCoordinate.y);
    return index > 0 && index < grid.getGrid().length
        && (currentIndex == index
        || !isPlayerBlockingTile(grid.getElementAt(index)))
}