import { GameConfig } from "../../utils/GameConfig";
import { BattleConfig } from "./BattleConfig";
import { Ball } from "./items/Ball";
import { Line } from "./items/Line";
import { Collide } from "./util/Collide";
import { Heap } from "./util/Heap";
import { Help } from "./util/Help";
import { Vector } from "./util/Vector";

const BASE_DMG = 500;
export class BattleDataManager {
    private static _instance: BattleDataManager = null;
    static get instance(): BattleDataManager {
        if (this._instance == null) {
            this._instance = new BattleDataManager();
        }
        return this._instance;
    }

    frameLines = [
        new Line({ x1: BattleConfig.GameRect.left, y1: BattleConfig.GameRect.top, x2: BattleConfig.GameRect.right, y2: BattleConfig.GameRect.top, solid: true, hide: 0, mid: 0 }),
        new Line({ x1: BattleConfig.GameRect.right, y1: BattleConfig.GameRect.top, x2: BattleConfig.GameRect.right, y2: BattleConfig.GameRect.bottom, solid: true, hide: 0, mid: 0 }),
        new Line({ x1: BattleConfig.GameRect.left, y1: BattleConfig.GameRect.bottom, x2: BattleConfig.GameRect.left, y2: BattleConfig.GameRect.top, solid: true, hide: 0, mid: 0 }),
        new Line({ x1: BattleConfig.GameRect.right, y1: BattleConfig.GameRect.bottom, x2: BattleConfig.GameRect.left, y2: BattleConfig.GameRect.bottom, solid: true, hide: 0, mid: 0 }),
    ];

    ldata = {
        lines: [],

        balls: new Heap(Ball.ballLess),

        base: { x: 250, y: 800 },

        nextBase: null,

        begin: { x: 0, y: 0 },

        enemys: {},

        startLine: 0,

        round: 0,

        ballDmg: BASE_DMG,

        isThrough: false,

        skills: [],

        pushed: -1,

        win: false,

        cmds: [],

        ops: [],

        takegrids: [],

        callid: 1001,
        interLen: 0,
        enemyCount:0,
        baseLine: null,
        roles:[],
        rect: null,
    };

    addCmd(cmd) {
        cmd.id = this.ldata.cmds.length + 1;
        this.ldata.cmds.push(cmd);
    }

    resetTakeGrids() {
        this.ldata.takegrids.length = 0;

        for (let i = 0; i < BattleConfig.Board.WIDTH * BattleConfig.Board.HEIGHT; i++) {
            this.ldata.takegrids.push(0);
        }

        let setTakeGrid = (grid, eid) => {
            if (grid < 0 || grid >= this.ldata.takegrids.length) {
                return;
            }
            if (this.ldata.takegrids[grid] != 0) {
                console.error("grid " + grid + " has taked");
            } else {
                this.ldata.takegrids[grid] = eid;
            }
        }

        for (let eid in this.ldata.enemys) {
            let enemy = this.ldata.enemys[eid];
            if (enemy.visible && enemy.hp > 0) {
                if (enemy.obj.size == 1) {
                    setTakeGrid(enemy.grid, enemy.id);
                } else {
                    // 超过1格的，将周围格子加上去。
                    for (let i = 0; i < enemy.obj.size; i++) {
                        for (let j = 0; j < enemy.obj.size; j++) {
                            let grid = enemy.grid + j + i * BattleConfig.Board.WIDTH;
                            setTakeGrid(grid, enemy.id);
                        }
                    }
                }
            }
        }
    }

    initEnemyLines() {
        let ret = {
            startLine: 0,
            lines: [],
            enemys: {},
            enemyCount: 0
        }
        let max_line = BattleConfig.config.stage.max_line;
        if (max_line < BattleConfig.Board.HEIGHT) {
            max_line = BattleConfig.Board.HEIGHT;
        }

        for (let line of this.frameLines) {
            ret.lines.push(line);
        }

        ret.startLine = max_line - BattleConfig.Board.HEIGHT;
        let yoffset = ret.startLine * BattleConfig.Board.SIDE;

        ret.enemys = BattleConfig.copyEnemies(BattleConfig.config.enemys);
        for (let eid in ret.enemys) {
            let enemy = ret.enemys[eid];
            if (enemy.solid) {
                ret.enemyCount += 1;
            }
            for (let line of enemy.lines) {
                line.y1 -= yoffset;
                line.y2 -= yoffset;
            }
            enemy.rect.top -= yoffset;
            enemy.rect.bottom -= yoffset;
            enemy.grid -= ret.startLine * BattleConfig.Board.WIDTH;

            if (enemy.rect.top < BattleConfig.EnemyRect.top || enemy.rect.bottom > BattleConfig.EnemyRect.bottom) {
                enemy.visible = false;
            }
        }

        // 按照个体设置
        for (let eid in ret.enemys) {
            let enemy = ret.enemys[eid];
            if (enemy.visible) {
                for (let l of enemy.lines)
                    ret.lines.push(l);
            }
        }

        Help.hidenInline(ret.lines, this.frameLines.length);
        return ret;
    }

    initLogic(base, interLen, roles) {
        Vector.assignPoint(base, this.ldata.base);
        this.ldata.interLen = interLen;
        this.ldata.lines.length = 0;
        this.ldata.balls.clear();
        this.ldata.enemyCount = 0;
        this.ldata.baseLine = new Line({ x1: 0, y1: base.y, x2: BattleConfig.Canvas.width, y2: base.y });
        this.ldata.roles = roles;
        this.ldata.rect = { left: BattleConfig.GameRect.left, right: BattleConfig.GameRect.right, top: BattleConfig.GameRect.top + BattleConfig.Board.SIDE, bottom: BattleConfig.GameRect.bottom };

        let ret = this.initEnemyLines();
        this.ldata.startLine = ret.startLine;
        this.ldata.lines = ret.lines;
        this.ldata.enemys = ret.enemys;
        this.ldata.enemyCount = ret.enemyCount;
        console.log("config enemy count:" + BattleConfig.config.stage.monsters.length);
        console.log("enemyCount:" + this.ldata.enemyCount);
        this.resetTakeGrids();
    }

    getNextBase(ball) {
        if (!this.ldata.nextBase) {
            let p = Vector.getRaySegmentIntersection(ball, ball.dir, this.ldata.baseLine);
            if (p != null) {
                this.ldata.nextBase = p;
            }
        }
    }

    removeDead(lines, id) {
        let temp = [];
        for (let l of lines) {
            if (!l.mid || l.mid != id) {
                l.unHide(id);
                temp.push(l);
            }
        }
        return temp;
    }

    addEnemy(id, mc, obj, grid) {
        let point = Help.getPointByGrid(obj, grid);
        let lines = Line.makeLines(id, point, obj, mc.solid);
        let enemy = {
            id: id,
            point: point,
            grid: grid,
            hp: mc.hp,
            visible: true,
            solid: mc.solid,
            evt: mc.evt,
            obj: obj,
            lines: lines,
            rect: Help.makeRect(lines)
        };

        for (let l of lines) {
            this.ldata.lines.push(l);
        }
        this.ldata.enemys[id] = enemy;
        this.ldata.enemyCount += 1;
        Help.hidenPartLines(lines, this.ldata.lines, this.frameLines.length);
        return enemy;
    }

    addEnemies(cid, count, grid) {
        let evts = [];
        let mc = BattleConfig.getMonster(cid);
        let obj = BattleConfig.config.objects[mc.type];
        let freeGrids = [];
        let g = grid;
        for (let i = 0; i < count; i++) {
            while (this.ldata.takegrids[g] != 0) {
                ++g;
            }
            freeGrids.push(g);
            ++g;
        }

        let newEnemies = [];
        for (let i = 0; i < count; i++) {
            let id = this.ldata.callid + i;
            //console.log("add enemy " + id + " at grid:" + freeGrids[i]);
            let e = this.addEnemy(id, mc, obj, freeGrids[i]);
            evts.push({ type: BattleConfig.EvtType.CALL_ENEMY, id: id, cid: cid, grid: freeGrids[i] });
            newEnemies.push(e);
        }
        this.ldata.callid += count;

        return { evts: evts, enemies: newEnemies };
    }

    onEnemyDead(id) {
        let ret = { deads: [id], evts: [], enemies: [] };

        // 移除向量
        this.ldata.lines = this.removeDead(this.ldata.lines, id);
        let enemy = this.ldata.enemys[id];
        // 清空格子占据信息
        for (let i = 0; i < enemy.obj.size; i++) {
            for (let j = 0; j < enemy.obj.size; j++) {
                let grid = enemy.grid + j + i * BattleConfig.Board.WIDTH;
                this.ldata.takegrids[grid] = 0;
            }
        }

        // 处理死亡事件
        if (enemy.evt && enemy.evt.type == BattleConfig.StageEvent.DEAD_CALL) {
            ret.deads = null;
            let r = this.addEnemies(enemy.evt.cid, enemy.evt.count, enemy.grid);
            ret.evts = r.evts;
            ret.enemies = r.enemies;
            //console.log("add evts:" + objToString(ret.evts));
            return ret;
        } else {
            for (let skill of this.ldata.skills) {
                if (skill.type == BattleConfig.SkillType.DEAD_TRIGGER) {
                    // 死亡触发技能
                }
            }
        }

        return ret;
    }

    checkCollide(deads) {
        let temp = [];
        if (deads) {
            // 只有目标被移除，只需要检测和这些目标相撞的球
            this.ldata.balls.foreach((ball) => {
                if (deads.indexOf(ball.nextCollideId()) != -1) {
                    ball.recoverState();
                    ball.calcCollide();
                }
                if (ball.nextCollidePoint())
                    temp.push(ball);
                else
                    this.getNextBase(ball);
            });
        } else {
            // 其他原因（比如召唤，移动）导致重新检测，需要全部重算一遍
            this.ldata.balls.foreach((ball) => {
                ball.recoverState();
                ball.calcCollide(ball);
                if (ball.nextCollidePoint())
                    temp.push(ball);
                else
                    this.getNextBase(ball);
            });
        }

        this.ldata.balls.clear();
        for (let ball of temp) {
            this.ldata.balls.add(ball);
        }
    }

    getRectRange(point, width, height) {
        return {
            x: (point.x - Math.floor(width / 2)) * BattleConfig.Board.SIDE + BattleConfig.Offset.x,
            y: (point.y - Math.floor(height / 2)) * BattleConfig.Board.SIDE + BattleConfig.Offset.y,
            width: width * BattleConfig.Board.SIDE,
            height: height * BattleConfig.Board.SIDE
        }
    }

    getCrossRange(point, horizon, vertical) {
        let ranges = [];
        ranges.push({
            x: point.x * BattleConfig.Board.SIDE + BattleConfig.Offset.x,
            y: point.y * BattleConfig.Board.SIDE + BattleConfig.Offset.y,
            width: BattleConfig.Board.SIDE,
            height: BattleConfig.Board.SIDE
        });
        for (let i = -horizon; i <= horizon; i++) {
            let x = point.x + i;
            if (x < 0 || x >= BattleConfig.Board.WIDTH || i == 0) {
                continue;
            }
            ranges.push({
                x: x * BattleConfig.Board.SIDE + BattleConfig.Offset.x,
                y: point.y * BattleConfig.Board.SIDE + BattleConfig.Offset.y,
                width: BattleConfig.Board.SIDE,
                height: BattleConfig.Board.SIDE
            });
        }

        for (let i = -vertical; i <= vertical; i++) {
            let y = point.y + i;
            if (y < 0 || y >= BattleConfig.Board.HEIGHT || i == 0) {
                continue;
            }
            ranges.push({
                x: point.x * BattleConfig.Board.SIDE + BattleConfig.Offset.x,
                y: y * BattleConfig.Board.SIDE + BattleConfig.Offset.y,
                width: BattleConfig.Board.SIDE,
                height: BattleConfig.Board.SIDE
            });
        }
        return ranges;
    }

    effectSkill(skill) {
        let effects = [];
        skill.round += 1;
        //console.log("skill.rect:" + objToString(skill.rect));
        for (let eid in this.ldata.enemys) {
            let enemy = this.ldata.enemys[eid];
            if (enemy.visible && enemy.solid && enemy.hp > 0 && Vector.rectInserect(enemy.rect, skill.rect)) {
                //console.log("inserect enemy rect:" + objToString(enemy.rect));
                enemy.hp -= skill.cfg.dmg;
                let cmd = { dmg: { id: eid, dmg: skill.cfg.dmg, hp: enemy.hp } , evts: []};
                effects.push(cmd);
                if (enemy.hp <= 0) {
                    let ret = this.onEnemyDead(eid);
                    cmd.evts = ret.evts;
                    this.ldata.enemyCount -= 1;
                }
            }
        }

        if (this.ldata.enemyCount <= 0) {
            this.addCmd({ type: BattleConfig.CmdType.WIN });
            this.ldata.win = true;
        } else if (this.ldata.lines.length <= this.frameLines.length && this.ldata.startLine > 0) {
            let pushLine = Math.min(this.ldata.startLine, 10);
            this.pushMap(pushLine);
        }

        return effects;
    }

    checkSkillValid() {
        let temp = [];
        for (let skill of this.ldata.skills) {
            if (skill.round >= skill.cfg.round) {
                this.addCmd({ type: BattleConfig.CmdType.REMOVE_SKILL, cid: skill.cid });
            } else {
                temp.push(skill);
            }
        }
        this.ldata.skills = temp;
    }

    useSkill(role, target) {
        this.ldata.ops.push({ op: BattleConfig.OpType.SKILL, rid: role.id, target: target ? Vector.copyPoint(target) : null });
        let cfg = role.skill;
        let cmd = { type: BattleConfig.CmdType.ROLE_SKILL, cid: role.id, target: target, cd: cfg.cd, range: [] , effects: []};
        this.addCmd(cmd);
        if (cfg.type == BattleConfig.SkillType.BALL_ADD) {
            this.ldata.ballDmg = cfg.dmg;
        } else if (cfg.type == BattleConfig.SkillType.ROUND_DAMAGE) {
            let range = this.getRectRange(target, cfg.width, cfg.height);
            let skill = { cid: role.id, cfg: cfg, rect: { left: range.x, top: range.y, right: range.x + range.width, bottom: range.y + range.height }, round: 0 };
            this.ldata.skills.push(skill);
            cmd.range.push(range);
            cmd.effects = this.effectSkill(skill);
        } else if (cfg.type == BattleConfig.SkillType.BALL_THROUGH) {
            this.ldata.isThrough = true;
            this.ldata.ballDmg *= 3;
        }

        this.checkSkillValid();
    }

    skillRound() {
        if (this.ldata.win) {
            return;
        }
        for (let skill of this.ldata.skills) {
            let cmd = { type: BattleConfig.CmdType.SKILL_EFFECT, cid: skill.cid , effects: []};
            this.addCmd(cmd);
            cmd.effects = this.effectSkill(skill);
            if (this.ldata.win) {
                break;
            }
        }

        this.checkSkillValid();
    }

    pushDataMap(data, pushLine) {
        data.lines.length = 0;
        for (let l of this.frameLines) {
            data.lines.push(l);
        }
        data.startLine -= pushLine;
        let yoffset = pushLine * BattleConfig.Board.SIDE;
        let subEnemyCount = 0;
        for (let eid in data.enemys) {
            let enemy = data.enemys[eid];
            if (enemy.hp <= 0) {
                continue;
            }
            let visible = true;
            for (let line of enemy.lines) {
                line.move(yoffset);
            }

            enemy.rect.top += yoffset;
            enemy.rect.bottom += yoffset;
            enemy.grid += pushLine * BattleConfig.Board.WIDTH;
            if (enemy.rect.top < BattleConfig.EnemyRect.top || enemy.rect.bottom > BattleConfig.EnemyRect.bottom) {
                visible = false;
            }

            if (enemy.visible && enemy.solid && !visible) {
                // 底线移除
                subEnemyCount = subEnemyCount + 1;
            }
            enemy.visible = visible;

            if (visible) {
                for (let line of enemy.lines) {
                    data.lines.push(line);
                }
            }
        }

        Help.hidenInline(data.lines, this.frameLines.length);
        return subEnemyCount;
    }

    pushMap(pushLine) {
        if (pushLine > 0) {
            this.ldata.enemyCount -= this.pushDataMap(this.ldata, pushLine);

            this.resetTakeGrids();

            this.addCmd({ type: BattleConfig.CmdType.PUSH, line: pushLine });
        }
    }

    ballRound() {
        while (!this.ldata.balls.empty()) {
            let ball = this.ldata.balls.pop();
            let line = ball.nextCollideLine();
            // 距离最短，移动后发生碰撞才会创建命令
            let cmd = {
                type: BattleConfig.CmdType.COLLIDE,
                bid: ball.id,
                dmg: null,
                target: Vector.copyPoint(ball.nextCollidePoint()),
                dir: null,
                reflect: null,
                evts: []
            };

            // 先将球转向,并将所有球的dist减去第一个球的dist
            let d = ball.restDist();
            this.ldata.balls.foreach((b) => {
                b.move(d);
            });
            ball.setCollideFinish();

            // 更新球的状态，最快的球移动到碰撞点，计算弹射后的方向和下次碰撞点
            if (ball.update()) {
                if (ball.nextCollidePoint()) {
                    cmd.reflect = Vector.copyPoint(ball.dir);
                    this.ldata.balls.add(ball);
                } else {
                    this.getNextBase(ball);
                }
            }

            if (line.mid) {
                let enemy = this.ldata.enemys[line.mid];
                // cmd.dir为null表示小球消失
                if (enemy.hp > 0) {
                    if (enemy.solid) {
                        enemy.hp -= this.ldata.ballDmg;
                        cmd.dmg = { id: enemy.id, sub: this.ldata.ballDmg, hp: enemy.hp };
                    } else {
                        enemy.hp -= 1;
                        cmd.dmg = { id: enemy.id, sub: 1, hp: enemy.hp };
                    }

                    if (enemy.hp <= 0) {
                        let ret = this.onEnemyDead(enemy.id);
                        cmd.evts = ret.evts;
                        // 中间可以插入一些死亡触发的技能，有新的死亡id可以加入进来，如果触发移动或者召唤，则传入null
                        this.checkCollide(ret.deads);
                        if (enemy.solid)
                            this.ldata.enemyCount -= 1;
                        if (this.ldata.enemyCount == 0) {
                            this.addCmd(cmd);
                            this.ldata.win = true;
                            this.addCmd({ type: BattleConfig.CmdType.WIN });
                            return;
                        }
                    }
                } else {
                    console.error("collide dead enemy! id=" + cmd.bid + " mid=" + line.mid);
                }
            }

            this.addCmd(cmd);
        }
    }

    enemyRound() {
        if (this.ldata.win) {
            return;
        }
    }

    pushRound() {
        if (this.ldata.win) {
            return;
        }
        let pushLine = 0;
        if (this.ldata.lines.length <= this.frameLines.length && this.ldata.startLine > 0) {
            pushLine = Math.min(this.ldata.startLine, 10);
        } else if (this.ldata.pushed + 1 < BattleConfig.config.stage.push.length) {
            let next_push = BattleConfig.config.stage.push[this.ldata.pushed + 1];
            if (this.ldata.round >= next_push.round) {
                pushLine = Math.min(this.ldata.startLine, next_push.line);
                this.ldata.pushed += 1;
            }
        }
        this.pushMap(pushLine);
    }

    endRound() {
        if (this.ldata.win) {
            return;
        }
        this.ldata.ballDmg = BASE_DMG;
        this.ldata.isThrough = false;
        if (this.ldata.nextBase) {
            Vector.assignPoint(this.ldata.nextBase, this.ldata.base);
        }

        this.addCmd({ type: BattleConfig.CmdType.ROUND_END, base: Vector.copyPoint(this.ldata.base) });
    }

    startRound(aimDir) {
        this.ldata.ops.push({ op: BattleConfig.OpType.BALL, dir: Vector.copyPoint(aimDir) })
        this.ldata.cmds.length = 0;
        Vector.assignPoint(aimDir, this.ldata.begin);

        let collide = Collide.lcheckNextCollide(this.ldata.base, this.ldata.begin, [], 0);
        let dist = Vector.distance({ x: collide.point.x - this.ldata.base.x, y: collide.point.y - this.ldata.base.y });
        let n = 0;
        for (let role of this.ldata.roles) {
            for (let i = 0; i < role.count; i++) {
                let ball = new Ball({
                    id: n + 1,
                    role: role,
                    x: this.ldata.base.x,
                    y: this.ldata.base.y,
                    collide: collide,
                    dist: dist + n * this.ldata.interLen,
                    dir: this.ldata.begin,
                    interLen: n * this.ldata.interLen
                });
                this.ldata.balls.add(ball);
                this.addCmd({
                    type: BattleConfig.CmdType.CREATE_BALL,
                    bid: n + 1,
                    cid: role.id,
                    dir: this.ldata.begin
                });
                ++n;
            }
        }

        this.ldata.nextBase = null;
    }

    updateRound() {
        console.time("round");
        // 剩余距离最短的球弹射
        this.ballRound();

        // 敌方行动
        this.enemyRound();

        // 回合结束推进
        this.ldata.round += 1;
        this.pushRound();

        // 技能回合
        this.skillRound();

        // 回合结束重置
        this.endRound();

        console.timeEnd("round");
    }
}