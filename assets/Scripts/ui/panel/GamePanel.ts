import { _decorator, Component, EventTouch, instantiate, Label, log, Node, Prefab, UITransform, Vec2, Vec3 } from 'cc';
import { BattleManager } from '../battle/BattleManager';
import { BattleDataManager } from '../battle/BattleDataManager';
import { GameAssetManager } from '../../utils/GameAssetManager';
import { BattleConfig } from '../battle/BattleConfig';
import { Handler } from '../../utils/Handler';
import { Vector } from '../battle/util/Vector';
import { Collide } from '../battle/util/Collide';
import { BallStatus, GameState } from '../battle/BattleConstant';
import { BattleRenderManager } from '../battle/BattleRenderManager';
import { UiBall } from '../items/UiBall';
const { ccclass, property } = _decorator;

@ccclass('GamePanel')
export class GamePanel extends Component {
    private _battleContainer: Node = null;
    private _xLab: Label;
    private _yLab: Label;
    private _locx: Label;
    private _locy: Label;

    nodeBalls: Node[] = [];
    start() {
        BattleManager.instance.init(Handler.create(this, this.onInit));
        this._battleContainer = this.node.getChildByName('battleContainer');
        log("GamePanel start");
        this._xLab = this.node.getChildByName('xLabel').getComponent(Label);
        this._yLab = this.node.getChildByName('yLabel').getComponent(Label);

        this._xLab.string = "x:0";
        this._yLab.string = "y:0";

        this._locx = this.node.getChildByName('xLabel-001').getComponent(Label);
        this._locy = this.node.getChildByName('yLabel-001').getComponent(Label);

    }

    update(deltaTime: number) {
        for (let i = 0; i < this.nodeBalls.length; i++) {
            const element = this.nodeBalls[i];
            let ball = (element.getComponent('UiBall') as UiBall).ball;

            // if(ball.status == BallStatus.MOVED) {
            element.setPosition(BattleConfig.rx(ball.x), BattleConfig.ry(ball.y));
            // }else {
            // element.removeFromParent();
            // this.nodeBalls.splice(i, 1);
            // }

            if(ball.status == BallStatus.DESTROY) {
                element.removeFromParent();
                this.nodeBalls.splice(i, 1);
            }

            // if (ball.id == 1) {
            //     log("ball",ball.id, ball.x, ball.y)

            //     log("element", element.position)
            // }
        }
    }

    onInit() {
        log("GamePanel onInit");
        let enemys = BattleDataManager.instance.ldata.enemys;
        for (let eid in enemys) {
            let enemy = enemys[eid];
            if (enemy.visible && enemy.hp > 0) {
                log("enemy", enemy);
                let mc = BattleConfig.getMonster(enemy.cid);
                let prefab = 'Prefab/' + mc.type;
                GameAssetManager.instance.loadBundleAsset('Battle', prefab, (err, res) => {
                    let enemyNode = instantiate(res);
                    enemyNode.setPosition(BattleConfig.rx(enemy.point.x), BattleConfig.ry(enemy.point.y - enemy.yoffset));
                    this._battleContainer.addChild(enemyNode);
                });
            }
        }

        this._battleContainer.on(Node.EventType.TOUCH_MOVE, this.onBattleTouchMove, this);
        this._battleContainer.on(Node.EventType.TOUCH_END, this.onForceBall, this);
        // this._battleContainer.on(Node.EventType.TOUCH_START, this.posTest, this);
        // this.node.on(Node.EventType.TOUCH_END, this.onNodeTouchEnd, this);

        this.node.getChildByName("Button").on(Node.EventType.TOUCH_END, this.onStart, this);
    }

    onStart() {
        BattleManager.instance.status = GameState.GS_AIM
    }

    onNodeTouchEnd(e: EventTouch) {
        log("onNodeTouchEnd", e)
        // log("e.getLocation", e.getLocation())
    }

    posTest(e: EventTouch) {
        // log("posTest", e)       
        let worldPos = e.getUILocation();
        log("worldPos", worldPos)
        let localPos = this._battleContainer.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(worldPos.x, worldPos.y, 0));
        log("localPos", localPos)
        let localPos2 = e.currentTarget.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(e.getLocation().x, e.getLocation().y, 0));
        log("localPos2", localPos2)
    }

    onBattleTouchMove(e: EventTouch) {
        // log("onBattleTouchMove")
        let worldPos = e.getUILocation();
        // log("worldPos", worldPos)
        let localPos = this._battleContainer.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(worldPos.x, worldPos.y, 0));
        this._locx.string = "locx:" + localPos.x;
        this._locy.string = "locy:" + localPos.y;

        BattleManager.instance.aimDir = Vector.normalize({
            x: BattleConfig.lx(localPos.x) - BattleManager.instance.base.x,
            y: BattleConfig.ly(localPos.y) - BattleManager.instance.base.y
        });

        this._xLab.string = "x:" + BattleManager.instance.aimDir.x;
        this._yLab.string = "y:" + BattleManager.instance.aimDir.y;

        let collisions = Collide.laim(BattleManager.instance.base, BattleManager.instance.aimDir, BattleManager.instance.times);

        for (let c of collisions) {
            c.radius = 2;
            c.color = "#1234bc";
            BattleManager.instance.collisions.push(c);
        }
    }

    onForceBall() {
        log("onForceBall")
        if (BattleManager.instance.status == GameState.GS_AIM) {
            if (BattleManager.instance.aimDir.y < 0) {
                BattleManager.instance.collisions.length = 0;
                BattleManager.instance.status = BattleManager.instance.gameMode;
                BattleManager.instance.totalDist = 0;
                BattleRenderManager.instance.status = BattleManager.instance.status;
                // if (BattleManager.instance.isDebug) {
                //     document.getElementById("dir-x").value = game.aimDir.x;
                //     document.getElementById("dir-y").value = game.aimDir.y;
                //     document.getElementById("ball-speed").value = game.speed;
                //     return;
                // }

                BattleManager.instance.speed = BattleManager.instance.basSpeed;
                if (!BattleManager.instance.doShootBall()) {
                    alert("shoot ball failed!");
                    return;
                }

                BattleManager.instance.loadBalls();
                //TODO: 获得cmds，进行展示


                for (let i = 0; i < BattleRenderManager.instance.balls.length; i++) {
                    const element = BattleRenderManager.instance.balls[i];
                    GameAssetManager.instance.getBundleAsset('Battle', 'Prefab/ball/ball1').then((res: Prefab) => {
                        let ballNode = instantiate(res);
                        ballNode.setPosition(BattleConfig.rx(element.x), BattleConfig.ry(element.y));
                        this._battleContainer.addChild(ballNode);
                        (ballNode.getComponent('UiBall') as UiBall).ball = element;
                        this.nodeBalls.push(ballNode);
                    });
                }

                BattleManager.instance.timer = setInterval(() => { BattleManager.instance.update() }, 10);
                // if (game.status == GameState.GS_PLAY) {
                // } else if (game.status == GameState.GS_DEBUG) {
                //     startDebug();
                // } else if (game.status == GameState.GS_GROUP_DEBUG) {
                //     console.log(objToString(game.cmds));
                //     startGroupDebug();
                // }
            }
        }
    }
}