import { FEvent } from "../util/FEvent";
import GameMainManager from "../util/GameMainManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LobbyPanel extends cc.Component { 
    private _rankBtn: cc.Node;
    private _adBtn:cc.Node;
    private _shareBtn:cc.Node;

    private _rankLab:cc.Label;
    private _helpBtn:cc.Node;

    onLoad() {
        let ui = this.node.getChildByName("ui");       
        this._rankBtn = ui.getChildByName('rankBtn');
        this._adBtn = ui.getChildByName("adBtn");
        this._shareBtn = ui.getChildByName("shareBtn");
        this._rankLab = ui.getChildByName("rankBtn").getChildByName("Background").getChildByName("rankNumLab").getComponent(cc.Label);
        this._helpBtn = ui.getChildByName("helpBtn");
   
        this._rankBtn.on(cc.Node.EventType.TOUCH_END, this.onRankBtnClick, this);
        this._adBtn.on(cc.Node.EventType.TOUCH_END, this.onAdBtnClick, this);
        this._shareBtn.on(cc.Node.EventType.TOUCH_END, this.onShareBtnClick, this);
        this._helpBtn.on(cc.Node.EventType.TOUCH_END, this.onHelpBtnClick, this);   

        this._shareBtn.getComponent(cc.Button).interactable = false;
        this._shareBtn.getChildByName("tili+1").active = false;
       
        FEvent.inst.on("reset", this.reset, this);
    }

    onHelpBtnClick() {
        GameMainManager.instance.showHelpPanel();
    }   

    onShareBtnClick() {

    }

    reset() {
        
    }

    onRankBtnClick() {

    }

    onAdBtnClick() {
        
    }
}