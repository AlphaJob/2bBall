import { _decorator, Component, instantiate, log, Node, UITransform } from 'cc';
import { BattleManager } from '../battle/BattleManager';
import { BattleDataManager } from '../battle/BattleDataManager';
import { GameAssetManager } from '../../utils/GameAssetManager';
import { BattleConfig } from '../battle/BattleConfig';
import { Handler } from '../../utils/Handler';
const { ccclass, property } = _decorator;

@ccclass('GamePanel')
export class GamePanel extends Component {


    _enemysContainer: Node = null;
    start() {
        BattleManager.instance.init(Handler.create(this, this.onInit));

        this._enemysContainer = this.node.getChildByName('enemys');

        log("GamePanel start");
        
    }

    update(deltaTime: number) {
        
    }

    onInit() {  

        log("GamePanel onInit");

        log("BattleDataManager enemys", BattleDataManager.instance.ldata.enemys)

        let enemys = BattleDataManager.instance.ldata.enemys;

        for (let eid in enemys) {
            let enemy = enemys[eid];
            if (enemy.visible && enemy.hp > 0) {
                log("enemy", enemy);
                let mc = BattleConfig.getMonster(enemy.cid);
                let prefab = 'Prefab/' + mc.type;
                GameAssetManager.instance.loadBundleAsset('Battle', prefab, (err, res) => {

                    let enemyNode = instantiate(res);
                    enemyNode.setPosition(enemy.point.x-300, enemy.point.y-700);
                    this._enemysContainer.addChild(enemyNode);
                });

            }
        }       
    }
}


