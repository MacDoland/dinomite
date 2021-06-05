import Vector from "./vector";

class Rectangle {
    center;
    width;
    height;

    constructor(center, width, height) {
        this.center = center;
        this.width = width;
        this.height = height;
        this.halfWidth = this.width / 2;
        this.halfHeight = this.height / 2;
    }

    getTopLeft() {
        return Vector.add(this.center, new Vector(-this.halfWidth, -this.halfHeight));
    }

    getTopRight() {
        return Vector.add(this.center, new Vector(this.halfWidth, -this.halfHeight));
    }

    getBottomLeft() {
        return Vector.add(this.center, new Vector(-this.halfWidth, this.halfHeight));
    }

    getBottomRight() {
        return Vector.add(this.center, new Vector(this.halfWidth, this.halfHeight));
    }

    getLeft() {
        return this.center.x - this.halfWidth;
    }

    getRight() {
        return this.center.x + this.halfWidth;
    }

    getBottom() {
        return this.center.y + this.halfWidth;
    }

    getTop() {
        return this.center.y - this.halfWidth;
    }
}

export default Rectangle;