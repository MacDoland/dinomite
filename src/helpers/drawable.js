class Drawable {
    type;
    props;

    constructor(type, props, zIndex, fill, stroke) {
        this.type = type;
        this.props = props;
        this.fill = fill;
        this.stroke = stroke
        this.zIndex = zIndex;
    }

    draw(context) {
        context.beginPath();

        switch (this.type) {
            case 'rect': {
                context.rect(...this.props);
                break;
            }
            case 'image': {
                context.drawImage(...this.props);
                break;
            }
        }

        if (this.fill) {
            context.fillStyle = this.fill;
            context.fill();
        }

        if (this.stroke) {
            context.strokeStyle = this.stroke;
            context.stroke();
        }

        context.closePath();
    }
}

export default Drawable;