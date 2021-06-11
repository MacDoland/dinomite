import { InputKeys } from "../game-management/input-manager";

export default {
    playerOne: {
        upKeyCode: InputKeys.KEY_W, 
        rightKeyCode: InputKeys.KEY_D, 
        downKeyCode: InputKeys.KEY_S, 
        leftKeyCode: InputKeys.KEY_A, 
        actionKeyCode: InputKeys.KEY_SPACE
    },
    playerTwo: {
        upKeyCode: InputKeys.KEY_UP, 
        rightKeyCode: InputKeys.KEY_RIGHT, 
        downKeyCode: InputKeys.KEY_DOWN, 
        leftKeyCode: InputKeys.KEY_LEFT, 
        actionKeyCode: InputKeys.KEY_NUM0
    }
}