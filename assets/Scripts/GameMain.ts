import { _decorator, AssetManager, Component, Label, log, Node, UITransform } from 'cc';
import { GameAssetManager } from './utils/GameAssetManager';
import { GameMainManager } from './utils/GameMainManager';
const { ccclass, property } = _decorator;

@ccclass('GameMain')
export class GameMain extends Component {

    private _loadingInfoLab: Label;
    private _prograssBarTF: UITransform;
    start() {
        GameMainManager.instance.init(this);

        let loadingCom: Node = this.node.getChildByName('start').getChildByName('loadingCom');
        this._prograssBarTF = loadingCom.getChildByName('loadingbar').getComponent(UITransform);
        this._loadingInfoLab = loadingCom.getChildByName('loadingInfoLab').getComponent(Label);

        this.loadUI();
    }

    loadUI() {
        GameAssetManager.instance.loadBundle('Battle').then((bundle: AssetManager.Bundle) => {
            GameAssetManager.instance.loadBundleAllAsset('Battle', (finish, total, item) => {
                total = 1363
                // log('finish:' + finish + ' total:' + total);
                this._prograssBarTF.width = 600 * finish / total;
                this._loadingInfoLab.string = 'loading……' + Math.floor(finish / total * 100)  + '%';
            }, (err, res) => {
                this.assetLoaded();
            });
        });
    }

    //资源加载完成
    assetLoaded() {
        this.node.getChildByName('start').getChildByName('loadingCom').removeFromParent();
        GameMainManager.instance.showGamePanel();
    }
}