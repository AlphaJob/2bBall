import { BattleDataManager } from "../BattleDataManager";
import { Vector } from "./Vector";

export class Collide {

    static resetIgnore(start, ignores, collide, finish = false) {
        let temp = [];
        // 任何情况，本次碰撞线加入下次碰撞检测的忽略组中
        if (collide.line && Vector.pointInLine(start, collide.line)) {
            temp.push(collide.line);
        }
        for (let l of ignores) {
            // 起点所在的线条如果还在忽略列表中，则继续保留在忽略列表，防止在同一条线上反复碰撞
            if (Vector.pointInLine(start, l)) {
                temp.push(l);
            }
        }
        return temp;
    }

    static lcheckNextCollide(start, dir, ignores, hitid) {
        return Collide.checkNextCollide(start, dir, ignores, hitid, BattleDataManager.instance.ldata.lines, BattleDataManager.instance.ldata.isThrough);
    }

    static checkNextCollide(start, dir, ignores, hitid, lines, through) {
        let nearest = 1e10;
        let collide = { point: null, line: null };
        for (let i = 0; i < lines.length; i++) {
            let l = lines[i];
            // 检测是否需要忽略，hitid表示当前需要忽略碰撞的敌方id
            if (hitid > 0 && l.mid == hitid) {
                continue;
            }
            // 忽略列表中直接忽略，非穿透球隐藏线也忽略检测（穿透球需要检测，才能对中间方块计算伤害）
            if (ignores.indexOf(l) != -1 || (l.hide != 0 && !through)) {
                continue;
            }
            // 检查入射方向与线的夹角，背面入射不碰撞
            let angle = Vector.getAngle(dir, l.normal);
            if (angle > Math.PI / 2) {
                continue;
            }
            let p = Vector.getRaySegmentIntersection(start, dir, l);
            if (p != null) {
                // 检测是否碰到内部隐藏虚线，非完整隐藏线段
                if (l.isHitHide(p)) {
                    continue;
                }
                let dist = Vector.distance({ x: p.x - start.x, y: p.y - start.y });
                // 实线和虚线相交时，算碰到实线
                if (dist < nearest || (dist == nearest && !collide.line.solid && l.solid)) {
                    collide.point = p;
                    collide.line = l;
                    nearest = dist;
                }
            }
        }

        return collide;
    }

    static lgetHitId(collide) {
        return Collide.getHitId(collide, BattleDataManager.instance.ldata.isThrough);
    }

    static getHitId(collide, through) {
        // 虚线物体或者当前为穿透球，第一次碰撞时需要记录id，再次碰撞其他物体前不会反复计算碰撞伤害
        // (再次碰到其他物体表示已经从记录物体中出去了)
        if (collide.line && (!collide.line.solid || through)) {
            return collide.line.mid;
        } else {
            return 0;
        }
    }

    static laim(base, dir, times) {
        return Collide.aim(base, dir, times, BattleDataManager.instance.ldata.lines, BattleDataManager.instance.ldata.isThrough);
    }

    static aim(base, dir, times, lines, through) {
        let n = dir;
        let start = base;
        let hitid = 0;
        let ignores = [];
        let collisions = [];
        while (collisions.length < times) {
            let collide = Collide.checkNextCollide(start, n, ignores, hitid, lines, through);
            if (!collide.point || !collide.line) {
                break;
            }

            collisions.push({ x: collide.point.x, y: collide.point.y });
            let reflect = collide.line.getReflectNorm(n, through);

            start = collide.point;
            n = reflect;
            ignores = Collide.resetIgnore(start, ignores, collide);
            hitid = Collide.getHitId(collide, through);
        }
        return collisions;
    }

}