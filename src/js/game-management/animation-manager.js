class AnimationManager {
    animations;

    constructor(){
        this.animations = {};
    }

    add(id, image, animation) {
        this.animations[id] = {
            animation,
            image
        };
    }

    get(id) {
        return this.animations[id].animation;
    }

    getImage(id) {
        return this.animations[id].image;
    }
}

export { AnimationManager }