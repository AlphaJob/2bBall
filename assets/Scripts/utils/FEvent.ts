import { _decorator, EventTarget, Node } from 'cc';
export class FEvent {
    private static _inst: EventTarget;
    static get inst() {
        if (!FEvent._inst) FEvent._inst = new EventTarget();
        return FEvent._inst;
    }

    static init() {
        return FEvent._inst;
    }

    /**
     * 使用 EventDispatcher 对象注册指定类型的事件侦听器对象，以使侦听器能够接收事件通知。
     * @param type		事件的类型。
     * @param listener	事件侦听函数。
     * @return 此 EventDispatcher 对象。
     */
    static on(type: string, listener: (...args: any[]) => void) {
        return FEvent.inst.on(type, listener);
    }

    /**
     * 从 EventDispatcher 对象中删除侦听器。
     * @param type		事件的类型。
     * @param listener	事件侦听函数。
     * @return 此 EventDispatcher 对象。
     */
    static off(type: string, listener: (...args: any[]) => void) {
        return FEvent.inst.off(type, listener);
    }

    /**
     * 派发事件。
     * @param type	事件类型。
     * @param data	（可选）回调数据。<b>注意：</b>如果是需要传递多个参数 p1,p2,p3,...可以使用数组结构如：[p1,p2,p3,...] ；如果需要回调单个参数 p ，且 p 是一个数组，则需要使用结构如：[p]，其他的单个参数 p ，可以直接传入参数 p。
     * @return 此事件类型是否有侦听者，如果有侦听者则值为 true，否则值为 false。
     */
    static emit(type: string, data?: any) {
        return FEvent.inst.emit(type, data);
    }

    /**
     * 使用 EventDispatcher 对象注册指定类型的事件侦听器对象，以使侦听器能够接收事件通知，此侦听事件响应一次后自动移除。
     * @param type		事件的类型。
     * @param listener	事件侦听函数。
     * @return 此 EventDispatcher 对象。
     */
    static once(type: string, listener: any) {
        return FEvent.inst.once(type, listener);
    }
}