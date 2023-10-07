import { GameEvent } from '../enum/GameEvent';
import { FEvent } from "./FEvent";

export default class DragDropManager {
    private static _instance: DragDropManager = null;
    static get instance(): DragDropManager {
        if (this._instance == null) {
            this._instance = new DragDropManager();
        }
        return this._instance;
    }

    dragDropItems: Array<any>;
    draggingItem: any;
    deleteTestTarget: cc.Node;

    init() {
        this.dragDropItems = [];
        FEvent.inst.on(GameEvent.DRAG_START, this.onDrageStart, this);
    }

    deleteItem(item: any) {
        for (let i = 0; i < this.dragDropItems.length; i++) {
            const element = this.dragDropItems[i];
            if (item === element) {
                this.dragDropItems.splice(i, 1);
            }
        }
    }

    onDrageStart(dragTarget: any) {
        for (let i = 0; i < this.dragDropItems.length; i++) {
            const element = this.dragDropItems[i];
            element && (element.node.zIndex = 0);
        }
        dragTarget.node.zIndex = 1;
        this.draggingItem = dragTarget;
    }


    reset() {
        FEvent.inst.removeAll(this);
    }
}
