import { _decorator, assetManager, AssetManager, Component, instantiate, log, Node, Prefab } from 'cc';
import { GameAssetManager } from './utils/GameAssetManager';
import { Handler } from './utils/Handler';
import { BattleManager } from './ui/battle/BattleManager';
const { ccclass, property } = _decorator;

@ccclass('GameMain')
export class GameMain extends Component {
    start() {
        console.log('GameMain start');
        GameAssetManager.instance.loadBundle('GameUI').then((bundle:AssetManager.Bundle) => {
            console.log('GameUI bundle loaded');
            GameAssetManager.instance.loadBundleAllAsset('GameUI', (finish, total, item) => {
                console.log('loading……' + Math.floor(100 * finish / total) + '%');
            }, (err, res) => {
                console.log('GameUI bundle loadDir complete');
                this.assetLoaded();
            });
        });
    }

    // // 加载资源回调
    // getBundle(bundlename, resname, cb: Handler) {
    //     let bundle = assetManager.getBundle(bundlename);
    //     bundle.load(resname, Prefab, (err, res: Prefab) => {
    //         if (err) {
    //         }
    //         else {
    //             cb.run();
    //         }
    //     });
    // }

    update(deltaTime: number) {
        
    }
    //资源加载完成
    assetLoaded() {
        BattleManager.instance.init();
    }
}


