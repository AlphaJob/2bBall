import { _decorator, Component, Node, NodeEventType } from 'cc';
import { FEvent } from './utils/FEvent';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    start() {
        console.log('PlayerController start');
        this.node.getChildByName("Button").on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        FEvent.on('test', this.onTest);
    }
    onTouchStart(TOUCH_START: NodeEventType, onTouchStart: any, arg2: this) {
        TOUCH_START = NodeEventType.TOUCH_START;
        console.log('onTouchStart:', TOUCH_START, onTouchStart, arg2)
        FEvent.emit('test', ['arg1', 'arg2'])
    }

    update(deltaTime: number) {
        
    }

    onTest(...args:any[]) {
        console.log('onTest:', args)
    }
}


