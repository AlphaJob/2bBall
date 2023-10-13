import { _decorator, Component, EventTouch, instantiate, Label, log, Node, Prefab, UITransform, Vec2, Vec3 } from 'cc';
import { BattleManager } from '../battle/BattleManager';
import { BattleDataManager } from '../battle/BattleDataManager';
import { GameAssetManager } from '../../utils/GameAssetManager';
import { BattleConfig } from '../battle/BattleConfig';
import { Vector } from '../battle/util/Vector';
import { Collide } from '../battle/util/Collide';
import { BallStatus, GameState } from '../battle/BattleConstant';
import { BattleRenderManager } from '../battle/BattleRenderManager';
import { UiBall } from '../items/UiBall';
import { UiEnemy } from '../items/UiEnemy';
import { Ball } from '../battle/items/Ball';
import { Help } from '../battle/util/Help';
import { Line } from '../battle/items/Line';
const { ccclass, property } = _decorator;

@ccclass('GamePanel')
export class GamePanel extends Component {
    status: GameState = GameState.GS_SKILL;
    aimDir = { x: 0, y: 0 };
    collisions = [];
    base = { x: 200, y: 552 };
    basSpeed = 8;
    speed = 1;
    speedAdd = 0;
    running = null;
    totalDist = 0;
    times = 50;
    roles = [];
    distInterval = 15;
    lastDist = 0;
    gameMode = GameState.GS_PLAY;
    isRemote = false;
    isDebug = false;

    pushed = 0;
    chooseRole = null;
    skillCD = [0, 0, 0, 0, 0];

    //----逻辑不在本地运行时，需要处理本地对象的状态-----
    startLine = 0;
    enemys = {};
    lines = [];
    through = false;
    //---------------------------------------------

    replayJson = "";
    replay = [];
    isPlayReplay = false;

    cmds = [];
    user: string;
    private _battleContainer: Node = null;
    private _xLab: Label;
    private _yLab: Label;
    private _locx: Label;
    private _locy: Label;

    balls: Ball[] = [];
    nodeBalls: Node[] = [];
    nodeEnemys: Node[] = [];
    start() {
        this._battleContainer = this.node.getChildByName('battleContainer');
        log("GamePanel start");
        this._xLab = this.node.getChildByName('xLabel').getComponent(Label);
        this._yLab = this.node.getChildByName('yLabel').getComponent(Label);

        this._xLab.string = "x:0";
        this._yLab.string = "y:0";

        this._locx = this.node.getChildByName('xLabel-001').getComponent(Label);
        this._locy = this.node.getChildByName('yLabel-001').getComponent(Label);

        BattleConfig.loadData(() => {
            this.roles = BattleConfig.config.roles;
            //逻辑
            BattleDataManager.instance.initLogic(this.base, this.distInterval, this.roles);
            //显示
            BattleRenderManager.instance.initRender(BattleDataManager.instance.ldata.lines, this.status, this.base, this.collisions, this.roles);

            this.onInit();
        });
    }

    update(deltaTime: number) {
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
                    this.nodeEnemys.push(enemyNode);
                    (enemyNode.getComponent('UiEnemy') as UiEnemy).data = enemy;
                });
            }
        }

        this._battleContainer.on(Node.EventType.TOUCH_MOVE, this.onBattleTouchMove, this);
        this._battleContainer.on(Node.EventType.TOUCH_END, this.onForceBall, this);
        this.node.getChildByName("Button").on(Node.EventType.TOUCH_END, this.onStart, this);
    }

    onStart() {
        this.status = GameState.GS_AIM
    }

    onBattleTouchMove(e: EventTouch) {
        let worldPos = e.getUILocation();
        let localPos = this._battleContainer.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(worldPos.x, worldPos.y, 0));
        this._locx.string = "locx:" + localPos.x;
        this._locy.string = "locy:" + localPos.y;

        this.aimDir = Vector.normalize({
            x: BattleConfig.lx(localPos.x) - this.base.x,
            y: BattleConfig.ly(localPos.y) - this.base.y
        });

        this._xLab.string = "x:" + this.aimDir.x;
        this._yLab.string = "y:" + this.aimDir.y;

        let collisions = Collide.laim(this.base, this.aimDir, this.times);

        for (let c of collisions) {
            c.radius = 2;
            c.color = "#1234bc";
            this.collisions.push(c);
        }
    }

    playCmd() {
        let d = this.run(0);

        if (d >= 0) {
            this.totalDist += d;
            while (d >= 0 && d < this.speed && this.running) {
                let x = this.run(d);
                if (x == -1) {
                    d = -1;
                    break;
                }
                this.totalDist += x;
                d += x;
            }
        }

        if (d == -1) {
            this.onfinish();
        } else if (!this.running) {
            this.unschedule(this.playCmd);
        }

        this.speed += this.speedAdd;
    }

    run(pass: number) {
        let cmd = this.running;
        if (cmd.type != BattleConfig.CmdType.COLLIDE) {
            //console.log("other cmd:" + objToString(cmd));
            if (cmd.type == BattleConfig.CmdType.ROLE_SKILL || cmd.type == BattleConfig.CmdType.SKILL_READY || cmd.type == BattleConfig.CmdType.SKILL_EFFECT || cmd.type == BattleConfig.CmdType.REMOVE_SKILL) {
                // this.onSkillCmd(cmd);
                // 运行中的状态，需要判断一下有没有下一条命令（debug模式一次可能不会跑完整个回合）
                if (this.cmds.length > 0)
                    this.running = this.cmds.shift();
                else
                    this.running = null;
                return 0;
            } else {
                console.log("exit run.");
                return -1;
            }
        }

        for (let ball of this.balls) {
            if (ball.status == BallStatus.CREATING) {
                if (this.totalDist >= (ball.id - 1) * this.distInterval) {
                    ball.status = BallStatus.MOVING;
                    ball.dist = -(this.totalDist - (ball.id - 1) * this.distInterval);
                } else {
                    break;
                }
            } else if (ball.status != BallStatus.DESTROY) {
                ball.status = BallStatus.MOVING;
                ball.dist = 0;
            }
        }

        //console.log("ball " + cmd.bid + " move. total ball count:" + this.balls.length);
        let ball = this.balls[cmd.bid - 1];
        if (ball.status != BallStatus.MOVING) {
            console.error("Ball " + ball.id + " is not moving.");
            console.log("cmd:", cmd);
            this.running = null;
            return -1;
        }
        let rest = this.speed - pass;
        let v = { x: cmd.target.x - ball.x, y: cmd.target.y - ball.y };
        let dist = Vector.distance(v);
        if (dist <= rest) {
            this.moveAll(dist);

            if (cmd.reflect == null) {
                ball.status = BallStatus.DESTROY;
            } else {
                Vector.assignPoint(cmd.reflect, ball.dir);
            }

            //界面处理
            // 小球
            for (let i = 0; i < this.nodeBalls.length; i++) {
                const element = this.nodeBalls[i];
                let nodeBall = (element.getComponent('UiBall') as UiBall).ball;
                element.setPosition(BattleConfig.rx(nodeBall.x), BattleConfig.ry(nodeBall.y));
                if (nodeBall.status == BallStatus.DESTROY) {
                    element.removeFromParent();
                    this.nodeBalls.splice(i, 1);
                }

            }

            // 移除死亡的单位
            if (cmd.dmg != null && cmd.dmg.hp <= 0) {
                for (let j = 0; j < this.nodeEnemys.length; j++) {
                    const node = this.nodeEnemys[j];
                    let enemy = (node.getComponent('UiEnemy') as UiEnemy).data;
                    if (enemy.id == cmd.dmg.id) {
                        node.removeFromParent();
                        this.nodeEnemys.splice(j, 1)
                    }
                }
                // this.nodeEnemys.forEach((node) => {
                //     let enemy = (node.getComponent('UiEnemy') as UiEnemy).data;
                //     if (enemy.id == cmd.dmg.id) {
                //         node.removeFromParent();
                //     }
                // }
                // );
            }

            // 处理事件
            // if (cmd.evts) {
            //     this.doCmdEvts(cmd.evts);
            // }

            // 运行中的状态，需要判断一下有没有下一条命令（debug模式一次可能不会跑完整个回合）
            if (this.cmds.length > 0)
                this.running = this.cmds.shift();
            else
                this.running = null;
            return dist;
        } else {
            this.moveAll(rest);
            return rest;
        }
    }

    onfinish() {
        while (this.running != null) {
            let cmd = this.running;
            //console.log(objToString(cmd));
            if (cmd.type == BattleConfig.CmdType.PUSH) {
                console.log("start push!");
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
                            this.nodeEnemys.push(enemyNode);
                            (enemyNode.getComponent('UiEnemy') as UiEnemy).data = enemy;
                        });
                    }
                }

                this.startPush();
                return;
            } else if (cmd.type == BattleConfig.CmdType.ROUND_END) {
                for (let i = 0; i < this.skillCD.length; i++) {
                    if (this.skillCD[i] > 0) {
                        this.skillCD[i] -= 1;
                        // const btn = document.getElementById("skill" + (i + 1));
                        // if (this.skillCD[i] <= 0) {
                        //     btn.innerHTML = "";
                        //     btn.disabled = false;
                        // } else {
                        //     btn.innerHTML = this.skillCD[i];
                        // }
                    }
                }
                BattleRenderManager.instance.resetSkillRoles();
                Vector.assignPoint(cmd.base, this.base);
                this.through = false;
            } else if (cmd.type == BattleConfig.CmdType.WIN) {
                console.assert(this.cmds.length == 0, "other cmd after win." + (this.cmds).toString());
                break;
            } else {
                this.onSkillCmd(cmd);
            }
            this.running = this.cmds.shift();
        }
        if (this.cmds.length == 0) {
            this.status = GameState.GS_AIM;
            BattleRenderManager.instance.balls.length = 0;
            BattleRenderManager.instance.status = this.status;
            //TODO: 打开两个技能面板
            // openSkillPanel();

            this.unscheduleAllCallbacks();

            if (this.running && this.running.type == BattleConfig.CmdType.WIN) {
                console.log("win.");
                this.status = GameState.GS_FINISH;
                BattleRenderManager.instance.status = this.status;
                BattleRenderManager.instance.skillSelect = null;
                BattleRenderManager.instance.skillRange = {};
                BattleRenderManager.instance.skillReadys = {};
                var replayJson;
                // if (this.isRemote) {
                //     let res = httpPost(uri + "/get_replay", "user=" + this.user);
                //     if (!res || res.code != 0) {
                //         return;
                //     }
                //     replayJson = JSON.stringify(res.data);
                //     console.log(replayJson);
                // } else {
                replayJson = JSON.stringify(BattleDataManager.instance.ldata.ops);
                // console.log(replayJson);
                // }

                if (!this.isPlayReplay) {
                    // alert("录像数据，可复制保存进行回放：" + replayJson);
                }
            }

            // BattleRenderManager.instance.draw();

            if (this.isPlayReplay) {
                this.playNext();
            }
        }
    }
    updatePush() {
        let totalPush = this.running.line * BattleConfig.Board.SIDE;
        let pushPixel = 8;
        if (this.nodeEnemys.length > 0) {
            this.pushed += pushPixel;
            for (let i = 0; i < this.nodeEnemys.length; i++) {
                const element = this.nodeEnemys[i];
                element.setPosition(element.position.x, element.position.y - 8);
            }
        } else {
            this.pushed = totalPush;
        }

        if (this.pushed >= totalPush) {
            console.log("push finish!");
            this.running = this.cmds.shift();
            this.onfinish();
        }
    }

    startPush() {
        this.pushed = 0;
        this.balls.length = 0;
        this.unschedule(this.playCmd);
        this.schedule(this.updatePush, 0.05);
    }

    updateSkillEffect(effects) {
        for (let e of effects) {
            if (e.dmg.hp <= 0) {
                BattleRenderManager.instance.lines = BattleDataManager.instance.removeDead(BattleRenderManager.instance.lines, e.dmg.id);
                if (this.isRemote) {
                    this.lines = BattleDataManager.instance.removeDead(this.lines, e.dmg.id);
                }

                if (e.evts) {
                    console.log("evts:" + (e.evts).toString());
                    this.doCmdEvts(e.evts);
                }
            }
        }
    }

    onSkillCmd(cmd) {
        if (cmd.type == BattleConfig.CmdType.ROLE_SKILL) {
            if (cmd.range) {
                //console.log("add range:" + cmd.type)
                BattleRenderManager.instance.addSkillRange(cmd.cid, cmd.range);
            }
            if (cmd.effects) {
                BattleManager.instance.updateSkillEffect(cmd.effects);
            }

            BattleRenderManager.instance.removeSkillReady(cmd.cid);

            if (cmd.cd > 0) {
                // const btn = document.getElementById("skill" + cmd.cid);
                // btn.disabled = true;
                // btn.innerHTML = cmd.cd;
                // this.skillCD[cmd.cid - 1] = cmd.cd;
            }
        } else if (cmd.type == BattleConfig.CmdType.REMOVE_SKILL) {
            BattleRenderManager.instance.removeSkillRange(cmd.cid);
        } else if (cmd.type == BattleConfig.CmdType.SKILL_EFFECT) {
            BattleManager.instance.updateSkillEffect(cmd.effects);
        } else if (cmd.type == BattleConfig.CmdType.SKILL_READY) {
            BattleRenderManager.instance.skillRoles[cmd.cid - 1] = 1;
            if (cmd.grid >= 0) {
                let ranges = BattleManager.instance.getSkillRanges(this.roles[cmd.cid - 1], cmd.grid);
                //console.log("ready skill " + cmd.cid + " range:" + objToString(ranges));
                BattleRenderManager.instance.addSkillReady(cmd.cid, ranges);
            }
        }
    }

    ballMove(ball, dist) {
        let d = dist - ball.dist;
        ball.x += ball.dir.x * d;
        ball.y += ball.dir.y * d;
        ball.status = BallStatus.MOVED;
    }

    moveAll(dist) {
        // 最后执行其他球的移动
        for (let ball of this.balls) {
            if (ball.status == BallStatus.MOVING) {
                this.ballMove(ball, dist);
            }
        }
    }

    lineEvts(cmd, data) {

    }

    doCmdEvts(evts) {
        for (let evt of evts) {
            if (evt.type == BattleConfig.EvtType.CALL_ENEMY) {
                let mc = BattleConfig.getMonster(evt.cid);
                let obj = BattleConfig.config.objects[mc.type];
                let point = Help.getPointByGrid(obj, evt.grid);
                let lines = Line.makeLines(evt.id, point, obj, mc.solid);
                let enemy = {
                    id: evt.id,
                    point: point,
                    grid: evt.grid,
                    hp: mc.hp,
                    visible: true,
                    solid: mc.solid,
                    evt: mc.evt,
                    obj: obj,
                    lines: lines,
                    rect: Help.makeRect(lines)
                };
                this.enemys[evt.id] = enemy;
                for (let l of lines) {
                    l.setColor(BattleConfig.ColorSet.LineSolid);
                    this.lines.push(l);
                }
                Help.hidenPartLines(lines, this.lines, BattleDataManager.instance.frameLines.length);

                let rlines = Line.makeLines(evt.id, point, obj, mc.solid);
                for (let l of rlines) {
                    l.setColor(BattleConfig.ColorSet.LineSolid);
                    BattleRenderManager.instance.lines.push(l);
                }
                Help.hidenPartLines(rlines, BattleRenderManager.instance.lines, BattleDataManager.instance.frameLines.length);
            }
        }
    }

    inRange(line) {
        return Vector.lineInRect(line, BattleConfig.EnemyRect);
    }

    getGridPoint(x, y) {
        return {
            x: Math.floor((x - BattleConfig.Offset.x) / BattleConfig.Board.SIDE),
            y: Math.floor((y - BattleConfig.Offset.y) / BattleConfig.Board.SIDE)
        };
    }

    gridToPoint(grid) {
        return {
            x: Math.floor(grid % BattleConfig.Board.WIDTH),
            y: Math.floor(grid / BattleConfig.Board.WIDTH)
        }
    }

    getSkillSelectRange(role, x, y) {
        let skill = role.skill;
        let p = BattleManager.instance.getGridPoint(x, y);
        return BattleDataManager.instance.getRectRange(p, skill.width, skill.height);
    }

    getSkillRanges(role, grid) {
        let skill = role.skill;
        let p = BattleManager.instance.gridToPoint(grid);
        let ranges = [];
        if (skill.shape == "rect") {
            ranges.push(BattleDataManager.instance.getRectRange(p, skill.width, skill.height));
        } else if (skill.shape == "cross") {
            ranges = BattleDataManager.instance.getCrossRange(p, skill.horizon, skill.vertical);
        }
        return ranges;
    }

    doUseSkill(role, target) {
        // hidden("replay");
        // if (this.isRemote) {
        //     let args = "user=" + this.user + "&rid=" + role.id;
        //     if (target) {
        //         args += "&x=" + target.x + "&y=" + target.y;
        //     } else {
        //         args += "&x=-1&y=-1";
        //     }
        //     let res = httpPost(uri + "/use_skill", args);
        //     if (!res || res.code != 0) {
        //         return false;
        //     }
        //     this.cmds = res.data;
        //     if (role.skill.type == SkillType.BALL_THROUGH) {
        //         this.through = true;
        //     }
        // } else {
        BattleDataManager.instance.useSkill(role, target);
        this.cmds = BattleDataManager.instance.ldata.cmds;
        // }

        console.log((this.cmds).toString());

        this.running = this.cmds.shift();
        BattleRenderManager.instance.skillRoles[role.id - 1] = 1;
        this.onfinish();
        BattleRenderManager.instance.draw();
        return true;
    }

    playNext() {
        if (this.replay.length == 0) {
            return;
        }

        let op = this.replay.shift();
        if (op.op == BattleConfig.OpType.SKILL) {
            let role = this.roles[op.rid - 1];
            this.doUseSkill(role, op.target);
        } else if (op.op == BattleConfig.OpType.BALL) {
            Vector.assignPoint(op.dir, this.aimDir);
            this.collisions.length = 0;
            this.status = GameState.GS_PLAY;
            this.totalDist = 0;
            this.speed = this.basSpeed;
            BattleRenderManager.instance.status = this.status;
            if (!this.doShootBall()) {
                console.error("shoot ball failed!");
                return;
            }
            this.loadBalls();
            //console.log("ball cmds:" + objToString(this.cmds));
            // this.timer = setInterval(() => { this.update() }, 10);

            this.schedule(this.playCmd, 0.01);
        }
    }

    onForceBall() {
        log("onForceBall")
        if (this.status == GameState.GS_AIM) {
            if (this.aimDir.y < 0) {
                this.collisions.length = 0;
                this.status = this.gameMode;
                this.totalDist = 0;
                this.speed = this.basSpeed;
                // 生成一个cmd数据，用于展示
                if (!this.doShootBall()) {
                    alert("shoot ball failed!");
                    return;
                }
                // 根据cmd数据，生成ball数据
                this.loadBalls();
                // 生成ball节点
                for (let i = 0; i < this.balls.length; i++) {
                    const element = this.balls[i];
                    GameAssetManager.instance.getBundleAsset('Battle', 'Prefab/ball/ball1').then((res: Prefab) => {
                        let ballNode = instantiate(res);
                        ballNode.setPosition(BattleConfig.rx(element.x), BattleConfig.ry(element.y));
                        this._battleContainer.addChild(ballNode);
                        (ballNode.getComponent('UiBall') as UiBall).ball = element;
                        this.nodeBalls.push(ballNode);
                    });
                }

                //继续cmd 数据，  进行运动展示
                this.schedule(this.playCmd, 0.01);
            }
        }
    }

    doShootBall() {
        BattleDataManager.instance.startRound(this.aimDir);
        BattleDataManager.instance.updateRound();
        this.cmds = BattleDataManager.instance.ldata.cmds;
        return true;
    }

    loadBalls() {
        let cmd = this.cmds.shift();
        while (cmd.type == BattleConfig.CmdType.CREATE_BALL) {
            let role = this.roles[cmd.cid - 1];
            let ball = new Ball({
                id: cmd.bid,
                x: this.base.x,
                y: this.base.y,
                color: role.color,
                dir: { x: cmd.dir.x, y: cmd.dir.y },
                dist: 0
            });
            this.balls.push(ball);
            cmd = this.cmds.shift();
        }
        this.running = cmd;
    }
}