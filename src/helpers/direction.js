import Vector from "../structures/vector";

const directions = {
    NONE: "NONE",
    UP: "UP",
    RIGHT: "RIGHT",
    DOWN: "DOWN",
    LEFT: "LEFT",
    LEFTDOWN: "LEFTDOWN",
    LEFTUP: "LEFTUP",
    RIGHTDOWN: "RIGHTDOWN",
    RIGHTUP: "RIGHTUP",
}

Object.freeze(directions);

const getDirectionOpposite = (direction) => {
    switch (direction) {
        case directions.UP:
            return directions.DOWN;
        case directions.RIGHT:
            return directions.LEFT;
        case directions.DOWN:
            return directions.UP;
        case directions.LEFT:
            return directions.RIGHT;
    }
};

const solveDirection = (positionA, positionB) => {
    let direction = directions.UP;

    if(positionA.x === positionB.x && positionA.y < positionB.y){
        direction = directions.UP;
    }
    else if(positionA.x > positionB.x && positionA.y === positionB.y){
        direction = directions.RIGHT;
    }
    else if(positionA.x < positionB.x && positionA.y === positionB.y){
        direction = directions.LEFT;
    }
    else if(positionA.x === positionB.x && positionA.y > positionB.y){
        direction = directions.DOWN;
    }

    return direction;
};

const solveBodyDirection = (positionA, positionB, positionC) => {
    let direction = directions.NONE;

    if(positionA.y < positionB.y && positionB.y < positionC.y){
        direction = directions.UP;
    }
    else if(positionA.x > positionB.x && positionB.x > positionC.x){
        direction = directions.RIGHT;
    }
    else if(positionA.x > positionB.x && positionB.y < positionC.y){
        direction = directions.RIGHTDOWN;
    }
    else if(positionA.y > positionB.y && positionB.x < positionC.x){
        direction = directions.RIGHTDOWN;
    }
    else if(positionA.x > positionB.x && positionB.y > positionC.y){
        direction = directions.RIGHTUP;
    }
    else if(positionA.y < positionB.y && positionB.x < positionC.x){
        direction = directions.RIGHTUP;
    }
    else if(positionA.x < positionB.x && positionB.x < positionC.x){
        direction = directions.LEFT;
    }
    else if(positionA.x < positionB.x && positionB.y > positionC.y){
        direction = directions.LEFTUP;
    }
    else if(positionA.y < positionB.y && positionB.x > positionC.x){
        direction = directions.LEFTUP;
    }
    else if(positionA.x < positionB.x && positionB.y < positionC.y){
        direction = directions.LEFTDOWN;
    }
    else if(positionA.y > positionB.y && positionB.x > positionC.x){
        direction = directions.LEFTDOWN;
    }
    else if(positionA.y > positionB.y && positionB.y > positionC.y) {
        direction = directions.DOWN;
    }

    return direction;
};

const directionAsVector = (direction) => {
    switch (direction) {
        case directions.UP:
            return new Vector(0, -1);
        case directions.RIGHT:
            return new Vector(1, 0);
        case directions.DOWN:
            return new Vector(0, 1);
        case directions.LEFT:
            return new Vector(-1, 0);
    }
}

const isDirection = (direction => {
    return Object.keys(directions).includes(direction);
})

export { directionAsVector, getDirectionOpposite, isDirection, solveDirection, solveBodyDirection };
export default directions;