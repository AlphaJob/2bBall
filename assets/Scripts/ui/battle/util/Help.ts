import { BattleConfig } from "../BattleConfig";
import { Line } from "../items/Line";

export class Help {
    static objToString(o) {
        let s = "{";
        let sep = "";
        for (let k in o) {
            s += sep + k + ":";
            if (typeof(o[k]) == "object") {
                s += Help.objToString(o[k]);    
            } else {
                s += o[k];
            }
            if (sep == "")
                sep = ",";
        }
        s += "}";
        return s;
    }
    
    static showVec(name, v) {
        console.log(name + ": {x:" + v.x + ",y:" + v.y + "}");
    }
    
    static vec2String(v) {
        return "{x:" + v.x + ",y:" + v.y + "}";
    }
    
    static copyLine(line) {
        let l = new Line(line);
        for (let l1 of line.hideLines) {
            l.hideLines.push(new Line(l1));
        }
        return l;
    }
    
    static getPointByGrid(obj, grid) {
        let x = Math.floor(grid % BattleConfig.Board.WIDTH);
        let y = Math.floor(grid / BattleConfig.Board.WIDTH);
        return {
            x: x * BattleConfig.Board.SIDE + obj.anchor.x + BattleConfig.Offset.x,
            y: y * BattleConfig.Board.SIDE + obj.anchor.y + BattleConfig.Offset.y
        }
    }
    
    static makeRect(lines) {
        let rect = {left: 1e10, right: 1e-10, top: 1e10, bottom: 1e-10};
        for (let l of lines) {
            let rl = {
                left: Math.min(l.x1, l.x2),
                top: Math.min(l.y1, l.y2),
                right: Math.max(l.x1, l.x2),
                bottom: Math.max(l.y1, l.y2)
            };
            rect.left = Math.min(rect.left, rl.left);
            rect.top = Math.min(rect.top, rl.top);
            rect.right = Math.max(rect.right, rl.right);
            rect.bottom = Math.max(rect.bottom, rl.bottom);
        }
        return rect;
    }
    
    static _hidenLine(l1, lines, start) {
        for (let i = start; i < lines.length; i++) {
            if (l1 === lines[i] || !lines[i].solid)
                continue;
            let l2 = lines[i];
            l1.hideEachOther(l2);
        }
    }
    
    static hidenPartLines(parts, lines, start) {
        for (let l1 of parts) {
            if (!l1.solid) {
                continue;
            }
            Help._hidenLine(l1, lines, start);
        }
    }
    
    static hidenInline(lines, start) {
        for (let j = start; j < lines.length; j++) {
            let l1 = lines[j];
            if (!l1.solid) {
                continue;
            }
            Help._hidenLine(l1, lines, start);
        }
    }
    
    static jsonToLua(jsonStr) {
        // 解析JSON字符串为JavaScript对象
        var jsonObj = JSON.parse(jsonStr);
      
        // 递归转换函数
        function convert(obj) {
            var luaStr = '';
            // 处理数组类型
            if (Array.isArray(obj)) {
                luaStr += '{';
                for (var i = 0; i < obj.length; i++) {
                    luaStr += convert(obj[i]);
                    if (i < obj.length - 1) {
                        luaStr += ', ';
                    }
                }
                luaStr += '}';
            } else if (typeof obj === 'object' && obj !== null) {
                // 处理对象类型
                luaStr += '{';
                var keys = Object.keys(obj);
                for (var j = 0; j < keys.length; j++) {
                    var key = keys[j];
                    if (typeof key === "string") {
                        luaStr += key + ' = ' + convert(obj[key]);
                    } else {
                        luaStr += '[' + key + '] = ' + convert(obj[key]);
                    }
                    if (j < keys.length - 1) {
                        luaStr += ',';
                    }
                }
                luaStr += '}';
            } else if (typeof obj === 'string') {
                // 处理字符串类型
                luaStr += '"' + obj.replace(/"/g, '\\"') + '"';
            } else {
                // 处理数字、布尔和null类型
                luaStr += String(obj);
            }
            return luaStr;
        }
      
        // 转换JSON对象为Lua字符串
        var luaCode = 'return ' + convert(jsonObj);
        return luaCode;
    }
}