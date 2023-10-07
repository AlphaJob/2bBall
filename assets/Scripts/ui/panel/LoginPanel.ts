import GameMainManager from "../util/GameMainManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LoginPanel extends cc.Component {
    private _input:cc.EditBox;
    private _registerBtn:cc.Node;
    private _randomBtn:cc.Node;

    onLoad () {
        this._input = this.node.getChildByName('input').getComponent(cc.EditBox);
        this._registerBtn = this.node.getChildByName('confirmBtn');
        this._randomBtn = this.node.getChildByName('randomBtn');

        this._registerBtn.on('click', this.onRegisterBtnClick, this);
        this._randomBtn.on('click', this.onRandomBtnClick, this);
    }

    onRegisterBtnClick() {
        if (this._input.string.length == 0) {
            return;
        }        
    }

    onSetName(data:any) {
        cc.log('onSetName', data);
        // cc.sys.localStorage.setItem(CData.uuid, CData.uname);
        GameMainManager.instance.showLobbyPanel();
        this.node.removeFromParent();
    }

    onSetNameError(data:any) {
        cc.log('onSetNameError', data);
    }

    onRandomBtnClick() {
        cc.log('onRandomBtnClick');
    }

    start () {
        
    }
}
