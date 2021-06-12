import directions, { isDirection, solveBodyDirection } from './direction';

describe('isDirection', () => {
    it('should return true when valid direction UP', () => {
        //Arrange
        const direction = directions.UP;

        //Act
        const actual = isDirection(direction);

        //Assert
        expect(actual).toBe(true);
    });
    it('should return true when valid direction RIGHT', () => {
        //Arrange
        const direction = directions.RIGHT;

        //Act
        const actual = isDirection(direction);

        //Assert
        expect(actual).toBe(true);
    });

    it('should return true when valid direction DOWN', () => {
        //Arrange
        const direction = directions.DOWN;

        //Act
        const actual = isDirection(direction);

        //Assert
        expect(actual).toBe(true);
    });

    it('should return true when valid direction LEFT', () => {
        //Arrange
        const direction = directions.LEFT;

        //Act
        const actual = isDirection(direction);

        //Assert
        expect(actual).toBe(true);
    });
});

describe('solveBodyDirection', () => {
    it('should return LEFT when all positions are aligned horizontally', () => {
        //Arrange
        const head  = { x: 4, y: 4 };
        const middle  = { x: 5, y: 4 };
        const tail  = { x: 6, y: 4 };
        const expected = directions.LEFT;

        //Act
        const actual = solveBodyDirection(head, middle, tail);

        //Assert
        expect(actual).toBe(expected);
    });

    it('should return RIGHTUP when all positions are cornered right-down', () => {
        //Arrange
        const head  = { x: 6, y: 4 };
        const middle  = { x: 5, y: 4 };
        const tail  = { x: 5, y: 5 };
        const expected = directions.RIGHTDOWN;

        //Act
        const actual = solveBodyDirection(head, middle, tail);

        //Assert
        expect(actual).toBe(expected);
    });

    it('should return RIGHTDOWN when all positions are cornered right-up', () => {
        //Arrange
        const head  = { x: 6, y: 4 };
        const middle  = { x: 5, y: 4 };
        const tail  = { x: 5, y: 3 };
        const expected = directions.RIGHTUP;

        //Act
        const actual = solveBodyDirection(head, middle, tail);

        //Assert
        expect(actual).toBe(expected);
    });

    it('should return LEFTDOWN when all positions are cornered down-right', () => {
        //Arrange
        const head  = { x: 6, y: 4 };
        const middle  = { x: 6, y: 3 };
        const tail  = { x: 5, y: 3 };
        const expected = directions.LEFTDOWN;

        //Act
        const actual = solveBodyDirection(head, middle, tail);

        //Assert
        expect(actual).toBe(expected);
    });

    it('should return LEFTDOWN when all positions are cornered right-up', () => {
        //Arrange
        const head  = { x: 4, y: 4 };
        const middle  = { x: 5, y: 4 };
        const tail  = { x: 5, y: 5 };
        const expected = directions.LEFTDOWN;

        //Act
        const actual = solveBodyDirection(head, middle, tail);

        //Assert
        expect(actual).toBe(expected);
    });

    it('should return LEFTUP when all positions are cornered left-down', () => {
        //Arrange
        const head  = { x: 4, y: 4 };
        const middle  = { x: 5, y: 4 };
        const tail  = { x: 5, y: 3 };
        const expected = directions.LEFTUP;

        //Act
        const actual = solveBodyDirection(head, middle, tail);

        //Assert
        expect(actual).toBe(expected);
    });

    it('should return LEFTUP when all positions are cornered down-left', () => {
        //Arrange
        const head  = { x: 5, y: 4 };
        const middle  = { x: 5, y: 5 };
        const tail  = { x: 4, y: 5 };
        const expected = directions.LEFTUP;

        //Act
        const actual = solveBodyDirection(head, middle, tail);

        //Assert
        expect(actual).toBe(expected);
    });

})