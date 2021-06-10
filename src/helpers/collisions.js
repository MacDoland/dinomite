import Rectangle from "../structures/rectangle";
import Vector from "../structures/vector";

export const resolveCollisions = (rectangleA, potentialCollisionRectangles) => {
    let offset = new Vector();

    potentialCollisionRectangles.forEach(collisionRectangle => {
        let overlap = Rectangle.getOverlap(rectangleA, collisionRectangle);

        if (overlap.x > 0 || overlap.y > 0) {

            if (overlap.x > overlap.y) {
                offset.add(overlap.getXOnly());
            }
            else {
                offset.add(overlap.getYOnly());
            }

            rectangleA.move(offset);
        }
    });

    return offset;
}