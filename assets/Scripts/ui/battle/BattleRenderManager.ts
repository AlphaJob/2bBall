import { BattleConfig } from "./BattleConfig";
import { BallStatus, GameState } from "./BattleConstant";
import { Help } from "./util/Help";

export class BattleRenderManager {
    private static _instance: BattleRenderManager = null;
    static get instance(): BattleRenderManager {
        if (this._instance == null) {
            this._instance = new BattleRenderManager();
        }
        return this._instance;
    }

    lines = [];
    balls = [];
    skillSelect = null;
    skillRange = {};
    skillRoles = [0, 0, 0, 0, 0];
    skillReadys = {};
    status: GameState = GameState.GS_SKILL;
    baseLine = null;
    base = null;
    collisions = [];
    roles = [];
    begin = null;

    initRender(lines, status, base, collisions, roles) {
        this.setLines(lines);
        this.status = status;
        this.base = base;
        this.collisions = collisions;
        this.baseLine = { x1: 0, y1: base.y, x2: BattleConfig.Canvas.width, y2: base.y, color: "#aaaaaa", width: 1 }
        this.roles = roles;
    }

    setLines(lines) {
        this.lines.length = 0;
        for (let l of lines) {
            let line = Help.copyLine(l);
            if (line.solid) {
                line.setColor(BattleConfig.ColorSet.LineSolid);
            } else {
                line.setColor(BattleConfig.ColorSet.LineDash);
            }
            this.lines.push(line);
        }
    }

    addSkillRange(cid, ranges) {
        let skillRanges = [];
        for (let r of ranges) {
            skillRanges.push({
                x: r.x,
                y: r.y,
                width: r.width,
                height: r.height,
                color: "rgba(255, 97, 97, 0.5)"
            });
        }
        this.skillRange[cid] = skillRanges;
    }

    removeSkillRange(cid) {
        delete this.skillRange[cid];
    }

    resetSkillRoles() {
        for (let i = 0; i < this.skillRoles.length; i++) {
            this.skillRoles[i] = 0;
        }
    }

    addSkillReady(cid, ranges) {
        let readys = [];
        for (let r of ranges) {
            readys.push({
                x: r.x,
                y: r.y,
                width: r.width,
                height: r.height,
                color: "rgba(97, 97, 255, 0.5)"
            });
        }
        this.skillReadys[cid] = readys;
    }

    removeSkillReady(cid) {
        delete this.skillReadys[cid];
    }

    //  gameCanvas = document.getElementById("scene");
     gameCanvas: HTMLCanvasElement = document.getElementById(
        "scene"
    ) as HTMLCanvasElement;
    gameCtx = this.gameCanvas.getContext("2d");
    //  gameCtx = this.gameCanvas.getContext("2d");
    draw() {
        // let gameCtx: any;
        this.gameCtx.clearRect(0, 0, BattleConfig.Canvas.width, BattleConfig.Canvas.height);

        this.drawDashLine(this.gameCtx, this.baseLine);

        for (let i = 0; i < this.roles.length; i++) {
            this.drawRole(this.gameCtx, { x: i * 80 + 10, y: this.base.y + 60, width: 60, height: 80, color: this.roles[i].color, border: this.skillRoles[i] != 0 });
        }

        for (let l of this.lines) {
            this.drawLine(this.gameCtx, l);
            for (let sl of l.hideLines) {
                this.drawLine(this.gameCtx, sl);
            }
            this.drawNormal(this.gameCtx, l);
        }

        for (let cid in this.skillRange) {
            let ranges = this.skillRange[cid];
            for (let r of ranges)
                this.drawRange(this.gameCtx, r);
        }

        for (let cid in this.skillReadys) {
            let ranges = this.skillReadys[cid];
            for (let r of ranges)
                this.drawRange(this.gameCtx, r);
        }

        for (let ball of this.balls) {
            // 起点或者消失的球不画
            if (ball.status != BallStatus.CREATING && ball.status != BallStatus.DESTROY && ball.y < BattleConfig.Board.HEIGHT * BattleConfig.Board.SIDE + 24) {
                this.drawBall(this.gameCtx, ball);
            }
        }

        if (this.status == GameState.GS_AIM) {
            this.drawBall(this.gameCtx, { x: this.base.x, y: this.base.y, radius: 5, color: "#ac2234" });
            if (this.collisions.length > 0) {
                let start = this.base;
                for (let i = 0; i < this.collisions.length; i++) {
                    this.drawBall(this.gameCtx, this.collisions[i]);
                    let end = this.collisions[i];
                    this.drawDashLine(this.gameCtx, {
                        x1: start.x,
                        y1: start.y,
                        x2: end.x,
                        y2: end.y,
                        color: "gray",
                        width: 1
                    });
                    start = end;
                }
            } else if (this.begin != null) {
                let target = {
                    x: this.base.x + this.begin.x * 1400,
                    y: this.base.y + this.begin.y * 1400
                }
                this.drawDashLine(this.gameCtx, {
                    x1: this.base.x,
                    y1: this.base.y,
                    x2: target.x,
                    y2: target.y,
                    color: "gray",
                    width: 1
                });
            }
        } else if (this.status == GameState.GS_FINISH) {
            this.gameCtx.font = 'bold 60px 微软雅黑';
            var grandient = this.gameCtx.createLinearGradient(0, 0, BattleConfig.Canvas.width, 0);
            grandient.addColorStop(0, "magenta");
            grandient.addColorStop(0.3, 'blue');
            grandient.addColorStop(1.0, 'red');
            //用渐变填色
            this.gameCtx.fillStyle = grandient;
            this.gameCtx.fillText('赢   了', BattleConfig.Canvas.width / 2 - 100, BattleConfig.Canvas.height / 2 - 10);
        } else if (this.status == GameState.GS_SKILL) {
            if (this.skillSelect) {
                this.skillSelect.color = "rgba(49, 194, 238, 0.5)";
                this.drawRange(this.gameCtx, this.skillSelect);
            }
        }
    }

    drawBall(ctx, { x, y, radius, color, dir = { x: 0, y: 0 } }) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();

        if (dir) {
            this.drawLine(ctx, { x1: x, y1: y, x2: x + dir.x * 20, y2: y + dir.y * 20, color: "#233488", width: 1 });
        }
    }

    drawNormal(ctx, l) {
        if (l.hide == 0) {
            let mid = {
                x: l.x1 + (l.x2 - l.x1) / 2,
                y: l.y1 + (l.y2 - l.y1) / 2
            }
            let normal = {
                x1: mid.x,
                y1: mid.y,
                x2: mid.x + l.normal.x * 10,
                y2: mid.y + l.normal.y * 10,
                color: "#338899",
                hide: 0
            }
            this.drawLine(ctx, normal);
        }
    }

    drawLine(ctx, { x1, y1, x2, y2, color, width = 2, hide = 0 }) {
        ctx.beginPath();
        ctx.lineWidth = width;
        if (hide > 0) {
            ctx.strokeStyle = "#ee7788";
        } else {
            ctx.strokeStyle = color;
        }
        ctx.lineCap = "round";
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    drawDashLine(ctx, { x1, y1, x2, y2, color, width = 2 }) {
        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.lineCap = "round";
        let old = ctx.getLineDash();
        ctx.setLineDash([20, 5]);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash(old);
    }

    drawRole(ctx, { x, y, width, height, color, border }) {
        ctx.beginPath();
        ctx.fillStyle = color;
        if (border) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#33bb33";
        }
        ctx.rect(x, y, width, height);
        if (border)
            ctx.stroke();
        ctx.fill();
    }

    drawRange(ctx, { x, y, width, height, color }) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.rect(x, y, width, height);
        ctx.fill();
    }
}