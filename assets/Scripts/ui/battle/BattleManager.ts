import { BallStatus, GameState } from "./BattleConstant";
import { BattleDataManager } from "./BattleDataManager";
import { BattleConfig } from "./BattleConfig";
import { Ball } from "./items/Ball";
import { BattleRenderManager } from "./BattleRenderManager";
import { Line } from "./items/Line";
import { Vector } from "./util/Vector";
import { Help } from "./util/Help";

export class BattleManager {
    private static _instance: BattleManager = null;
    static get instance(): BattleManager {
        if (this._instance == null) {
            this._instance = new BattleManager();
        }
        return this._instance;
    }

    private _battleType: number;
    public get battleType(): number {
        return this._battleType;
    }
    private _currentBattleData: any;
    init() {
        // hidden("debug-panel");
        BattleConfig.loadData(() => {
            this.roles = BattleConfig.config.roles;
            // if ( this.isRemote) {
            //     let res = httpPost(uri + "/init_ this", "");
            //     if (!res || res.code != 0) {
            //         alert("init game failed!");
            //         return;
            //     }
            //     let ret = initEnemyLines();
            //      this.startLine = ret.startLine;
            //      this.enemys = ret.enemys;
            //      this.lines = ret.lines;
            //      this.user = res.data;
            //     initRender( this.lines,  this.status,  this.base,  this.collisions,  this.roles);
            // } else {
            //逻辑
            BattleDataManager.instance.initLogic(this.base, this.distInterval, this.roles);
            //显示
            // initRender(BattleDataManager.instance.ldata.lines,  this.status,  this.base,  this.collisions,  this.roles);
            // }

            // draw();
            // addUIEvents();

        });
    }

    status: GameState = GameState.GS_SKILL;
    aimDir = { x: 0, y: 0 };
    collisions = [];
    base = { x: 200, y: 552 };
    timer = -1;
    basSpeed = 8;
    speed = 1;
    speedAdd = 0;
    running = null;
    totalDist = 0;
    time = 50;
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

    loadBalls() {
        let cmd = this.cmds.shift();
        while (cmd.type == BattleConfig.CmdType.CREATE_BALL) {
            let role =  this.roles[cmd.cid - 1];
            let ball = new Ball({
                id: cmd.bid,
                x:  this.base.x,
                y:  this.base.y,
                color: role.color,
                dir: { x: cmd.dir.x, y: cmd.dir.y },
                dist: 0
            });
            BattleRenderManager.instance.balls.push(ball);
            cmd =  this.cmds.shift();
        }
        this.running = cmd;
    }

    updatePush() {
        let totalPush =  this.running.line * BattleConfig.Board.SIDE;
        let pushPixel = 8;
        if (BattleRenderManager.instance.lines.length > 3) {
             this.pushed += pushPixel;

            let temp = [];
            for (let i = 0; i < 3; i++) {
                temp.push(BattleRenderManager.instance.lines[i]);
            }

            for (let i = 3; i < BattleRenderManager.instance.lines.length; i++) {
                let line = BattleRenderManager.instance.lines[i];
                line.y1 += pushPixel;
                line.y2 += pushPixel;
                if (this.inRange(line)) {
                    temp.push(line);
                }
            }
            BattleRenderManager.instance.lines = temp;

            BattleRenderManager.instance.draw();
        } else {
             this.pushed = totalPush;
        }

        if ( this.pushed >= totalPush) {
            console.log("push finish!");
            // if ( this.isRemote) {
            //     //pushDataMap( this,  this.running.line);
            //     let res = httpPost(uri + "/get_lines", "user=" +  this.user);
            //     if (!res || res.code != 0) {
            //         return;
            //     }
            //     //console.log(objToString(res.data));
            //      this.lines = [];
            //     for (let l of res.data) {
            //         let l1 = new Line(l);
            //          this.lines.push(l1);
            //     }
            //     setLines( this.lines);
            // } else {
                BattleRenderManager.instance.setLines(BattleDataManager.instance.ldata.lines);
            // }
             this.running =  this.cmds.shift();
            this.onfinish();
        }
    }

    startPush() {
        this.pushed = 0;
        BattleRenderManager.instance.balls.length = 0;
        clearInterval(this.timer);
        this.timer = setInterval(this.updatePush, 50);
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

    onfinish() {
        while (this.running != null) {
            let cmd = this.running;
            //console.log(objToString(cmd));
            if (cmd.type == BattleConfig.CmdType.PUSH) {
                console.log("start push!");
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

            if (this.timer > 0) {
                clearInterval(this.timer);
                this.timer = -1;
            }

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
                    console.log(replayJson);
                // }

                if (!this.isPlayReplay) {
                    alert("录像数据，可复制保存进行回放：" + replayJson);
                }
            }

            BattleRenderManager.instance.draw();

            if (this.isPlayReplay) {
                this.playNext();
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
        for (let ball of BattleRenderManager.instance.balls) {
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

    run(pass) {
        let cmd = this.running;
        if (cmd.type != BattleConfig.CmdType.COLLIDE) {
            //console.log("other cmd:" + objToString(cmd));
            if (cmd.type == BattleConfig.CmdType.ROLE_SKILL || cmd.type == BattleConfig.CmdType.SKILL_READY || cmd.type == BattleConfig.CmdType.SKILL_EFFECT || cmd.type == BattleConfig.CmdType.REMOVE_SKILL) {
                this.onSkillCmd(cmd);
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

        for (let ball of BattleRenderManager.instance.balls) {
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

        //console.log("ball " + cmd.bid + " move. total ball count:" + BattleRenderManager.instance.balls.length);
        let ball = BattleRenderManager.instance.balls[cmd.bid - 1];
        if (ball.status != BallStatus.MOVING) {
            console.error("Ball " + ball.id + " is not moving.");
            console.log("cmd:" + (cmd).toString());
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

            // 移除死亡的单位
            if (cmd.dmg != null && cmd.dmg.hp <= 0) {
                BattleRenderManager.instance.lines = BattleDataManager.instance.removeDead(BattleRenderManager.instance.lines, cmd.dmg.id);
            }

            if (this.isRemote) {
                // 移除死亡的单位
                if (cmd.dmg != null) {
                    let enemy = this.enemys[cmd.dmg.id];
                    if (enemy) {
                        enemy.hp = cmd.dmg.hp;
                    }
                    if (cmd.dmg.hp <= 0)
                        this.lines = BattleDataManager.instance.removeDead(this.lines, cmd.dmg.id);
                }
            }

            // 处理事件
            if (cmd.evts) {
                this.doCmdEvts(cmd.evts);
            }

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

    update() {
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
            clearInterval(this.timer);
            this.timer = -1;
        }

        this.speed += this.speedAdd;

        BattleRenderManager.instance.draw();
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

    doShootBall() {
        // if (this.isRemote) {
        //     let res = httpPost(uri + "/shoot_ball", "x=" + this.aimDir.x + "&y=" + this.aimDir.y + "&user=" + this.user);
        //     if (!res || res.code != 0) {
        //         return false;
        //     }
        //     this.cmds = res.data;
        // } else {
            BattleDataManager.instance.startRound(this.aimDir);
            BattleDataManager.instance.updateRound();
            this.cmds = BattleDataManager.instance.ldata.cmds;
        // }
        //console.log(objToString(this.cmds));
        return true;
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
            this.timer = setInterval(this.update, 10);
        }
    }
}
