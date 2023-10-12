import { _decorator, Component, Node } from 'cc';
import { Ball } from '../battle/items/Ball';
const { ccclass, property } = _decorator;

@ccclass('UiBall')
export class UiBall extends Component {
    private _ballId: number = 0;
    ball:Ball = null;
    start() {

    }

    update(deltaTime: number) {
        
    }
}


