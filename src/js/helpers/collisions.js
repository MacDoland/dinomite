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


//This used to belong to game manager loop:
 // let offsetRight, offsetLeft, offsetUp, offsetDown;
            // let collider = this.#player.getGlobalBoundingBox().clone();
            // let playerTileCoordinate = Grid.convertIndexToCoordinate(gridIndex, 15, 15).multiplyScalar(100);
            // let neighbours = this.#grid.getNeighbours(gridIndex);


            // offsetRight = collider.getRight() - playerTileCoordinate.x - 100;
            // const isCollidingRight = offsetRight > 0;

            // offsetLeft = collider.getLeft() - playerTileCoordinate.x;
            // const isCollidingLeft = offsetLeft < 0;

            // offsetDown = collider.getBottom() - playerTileCoordinate.y - 100;
            // const isCollidingDown = offsetDown > 0;

            // offsetUp = collider.getTop() - playerTileCoordinate.y;
            // const isCollidingUp = offsetUp < 0;

            // this.#logger.log('player collisions', {
            //     isCollidingRight,
            //     isCollidingLeft,
            //     isCollidingDown,
            //     isCollidingUp
            // });

            // if(isCollidingRight && isCollidingUp){
            //     if(offsetRight < offsetUp){
            //         offset.add(new Vector(-offsetRight, 0));
            //     }
            //     else{
            //         offset.add(new Vector(0, -offsetUp));
            //     }
            // }
            // else if (isCollidingRight){
            //     offset.add(new Vector(-offsetRight, 0));
            // }
            // else{
            //     offset.add(new Vector(0, -offsetUp));
            // }

            // if(isCollidingRight && isCollidingDown){
            //     if(offsetRight < offsetDown){
            //         offset.add(new Vector(-offsetRight, 0));
            //     }
            //     else{
            //         offset.add(new Vector(0, -offsetDown));
            //     }
            // }
            // else if (isCollidingRight){
            //     offset.add(new Vector(-offsetRight, 0));
            // }
            // else{
            //     offset.add(new Vector(0, -offsetDown));
            // }


            // if (isCollidingDown || isCollidingLeft || isCollidingRight || isCollidingUp) {
            //     console.log('overlap', `up: ${isCollidingUp} right: ${isCollidingRight} down: ${isCollidingDown} left: ${isCollidingLeft} `);
            // }



            // let colliders = Object.keys(neighbours)
            //     .map(key => neighbours[key])
            //     .flat()
            //     .map((index) => {
            //         return new Rectangle(Grid.convertIndexToCoordinate(index, 15, 15).multiplyScalar(100).add(new Vector(50, 50)), 100, 100);
            //     });

            // this.#colliders = [collider.clone(), ...colliders];

            //   let newOffSet = resolveCollisions(collider, colliders);

            // if (newOffSet.x != 0 || newOffSet.y != 0) {
            //     console.log('newOffSet', newOffSet);
            // }
