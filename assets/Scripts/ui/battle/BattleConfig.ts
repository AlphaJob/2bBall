import {  JsonAsset} from "cc"
import { Line } from "./items/Line"
import { Vector } from "./util/Vector"
import { GameAssetManager } from "../../utils/GameAssetManager"
import { Help } from "./util/Help"

export class BattleConfig {
    static CmdType = {
        CREATE_BALL: 1,
        COLLIDE: 2,
        ROLE_SKILL: 3,
        ENEMY_SKILL: 4,
        REMOVE_SKILL: 5,
        SKILL_EFFECT: 6,
        ENEMY_MOVE: 7,
        SKILL_READY: 8,
        PUSH: 11,
        ROUND_END: 12,
        WIN: 13,
        LOSE: 14
    }

    static ColorSet = {
        LineSolid: "#00aa11",
        LineDash: "#ebbef7"
    }

    static SkillType = {
        BALL_ADD: 1,
        RANGE_TRIGGER: 2,
        ROUND_DAMAGE: 3,
        SOLID_BLOCK: 4,
        DASH_BLOCK: 5,
        BALL_THROUGH: 6,
        DEAD_TRIGGER: 7
    }

    static StageEvent = {
        DEAD_CALL: 1, // cid, count
        HIT_MOVE: 2, // 
        HIT_CHANGE: 3, // shapes|angle 
        ROUND_MOVE: 4 // move_type
    }

    static EvtType = {
        CALL_ENEMY: 1, // {id: 1, cid:1, grid:1}
        ENEMY_MOVE: 2, // {id: 1, grid: 2}
        SKILL_TRIGGER: 3, // {skill:1...}
        ROTATE: 4
    }

    static OpType = {
        BALL: 1,
        SKILL: 2
    }

    static Board = {
        WIDTH: 8,
        HEIGHT: 11,
        SIDE: 48
    }

    static Canvas = {
        width: 400,
        height: 700
    }


    static Offset = {
        x: (BattleConfig.Canvas.width - BattleConfig.Board.WIDTH * BattleConfig.Board.SIDE) / 2,
        y: 5
    }

    static GameRect = {
        left: BattleConfig.Offset.x,
        top: BattleConfig.Offset.y,
        right: BattleConfig.Board.WIDTH * BattleConfig.Board.SIDE + BattleConfig.Offset.x,
        bottom: BattleConfig.Board.HEIGHT * BattleConfig.Board.SIDE + BattleConfig.Offset.y
    }

    static EnemyRect = {
        left: BattleConfig.GameRect.left,
        top: BattleConfig.GameRect.top + BattleConfig.Board.SIDE,
        right: BattleConfig.GameRect.right,
        bottom: BattleConfig.GameRect.bottom
    }

    static config = {
        stage_monsters: null,
        enemys: [],

        objects: null,
        monsters: null,
        roles: null,
        stage: null
    }

    static getMonster(cid) {
        for (let m of BattleConfig.config.monsters) {
            if (m.id == cid) {
                return m;
            }
        }
        return null;
    };

    static loadData(onfinish) {
        // 加载配置文件， 并赋值
        GameAssetManager.instance.loadBundleAllAsset('resources', (finish, total, item) => {
            console.log('loading……' + Math.floor(100 * finish / total) + '%');
        }, (err, res) => {
            console.log('GameUI bundle loadDir complete');

            GameAssetManager.instance.getBundleAsset('resources', 'config/object').then((res: JsonAsset) => {
                BattleConfig.config.objects = res.json;
                for (let k in BattleConfig.config.objects) {
                    let obj = BattleConfig.config.objects[k];
                    obj.size = obj.anchor.x * 2 / BattleConfig.Board.SIDE;
                }
                GameAssetManager.instance.getBundleAsset('resources', 'config/monster').then((res:JsonAsset) => {
                    BattleConfig.config.monsters = res.json;

                    GameAssetManager.instance.getBundleAsset('resources', 'config/role').then((res:JsonAsset) => {
                        BattleConfig.config.roles = res.json;

                        GameAssetManager.instance.getBundleAsset('resources', 'config/stage').then((res:JsonAsset) => {
                            BattleConfig.config.stage = res.json;
                            BattleConfig.config.stage_monsters = {}
                            for (let m of BattleConfig.config.stage.monsters) {
                                BattleConfig.config.stage_monsters[m.id] = m;
                                let mc = BattleConfig.getMonster(m.cid);
                                if (mc == null) {
                                    console.log("not find monster " + m.cid);
                                    continue;
                                }
                                let obj = BattleConfig.config.objects[mc.type];
                                if (!m.point) {
                                    m.point = Help.getPointByGrid(obj, m.grid);
                                }

                                let lines = Line.makeLines(m.id, m.point, obj, mc.solid);
                                BattleConfig.config.enemys.push({
                                    id: m.id,
                                    point: m.point,
                                    grid: m.grid,
                                    hp: mc.hp,
                                    solid: mc.solid,
                                    evt: mc.evt,
                                    obj: obj,
                                    lines: lines,
                                    rect: Help.makeRect(lines)
                                });
                            }
                            onfinish();
                        });
                    });  
                });
            }); 
        });
    }

    static copyEnemies(enemys) {
        let ret = {};
        for (let enemy of enemys) {
            let e = {
                id: enemy.id,
                point: Vector.copyPoint(enemy.point),
                grid: enemy.grid,
                hp: enemy.hp,
                visible: true,
                solid: enemy.solid,
                evt: enemy.evt,
                obj: enemy.obj,
                lines: [],
                rect: Vector.copyRect(enemy.rect)
            }
            for (let l of enemy.lines) {
                e.lines.push(new Line(l));
            }
            ret[e.id] = e;
        }
        return ret;
    }
}