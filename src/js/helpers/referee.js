import { TileState } from "../state/tile-state";
import Vector from "../structures/vector";
import { isBlockingTile, isPlayerBlockingTile } from "./grid-helpers";

export const processPlayerMovement = (grid, bounds, offset, elevation) => {
    let newOffset = new Vector();

    if (grid && bounds && offset && (offset.x != 0 || offset.y != 0)) {
        const canMoveTopRightX = canMove(offset.getXOnly(), bounds.topRight, grid, elevation);
        const canMoveBottomRightX = canMove(offset.getXOnly(), bounds.bottomRight, grid, elevation);
        const canMoveTopLeftX = canMove(offset.getXOnly(), bounds.topLeft, grid, elevation);
        const canMoveBottomLeftX = canMove(offset.getXOnly(), bounds.bottomLeft, grid, elevation);

        const canMoveTopRightY = canMove(offset.getYOnly(), bounds.topRight, grid, elevation);
        const canMoveBottomRightY = canMove(offset.getYOnly(), bounds.bottomRight, grid, elevation);
        const canMoveTopLeftY = canMove(offset.getYOnly(), bounds.topLeft, grid, elevation);
        const canMoveBottomLeftY = canMove(offset.getYOnly(), bounds.bottomLeft, grid, elevation);

        if (canMoveTopRightX && canMoveBottomRightX && canMoveTopLeftX && canMoveBottomLeftX) {
            newOffset.add(offset.getXOnly())
        }

        if (canMoveTopRightY && canMoveBottomRightY && canMoveTopLeftY && canMoveBottomLeftY) {
            newOffset.add(offset.getYOnly())
        }
    }

    return newOffset;
}


export const canMove = (offset, position, grid, elevation) => {
    const potentialPosition = Vector.add(position, offset);
    let currentGridCoordinate = Vector.multiplyScalar(position, 1 / 100).floor();
    let gridCoordinate = Vector.multiplyScalar(potentialPosition, 1 / 100).floor();
    let currentIndex = grid.getIndex(currentGridCoordinate.x, currentGridCoordinate.y);
    let nextIndex = grid.getIndex(gridCoordinate.x, gridCoordinate.y);
    let isWithinGrid = nextIndex > 0 && nextIndex < grid.getGrid().length;
    let isAlreadyOnTile = currentIndex == nextIndex;
    let canMoveOnElevation = currentIndex === nextIndex
        || (currentIndex !== nextIndex 
            && elevation[currentIndex] === elevation[nextIndex]
            || grid.getElementAt(currentIndex) === TileState.STAIRS
            || grid.getElementAt(nextIndex) === TileState.STAIRS);
    return isWithinGrid && canMoveOnElevation && (isAlreadyOnTile || !isPlayerBlockingTile(grid.getElementAt(nextIndex)))
}