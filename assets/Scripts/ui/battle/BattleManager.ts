import { EventTarget } from "cc";
import { GameState } from "./BattleConstant";

export default class BattleManager extends EventTarget {
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
        this.initLogic();
        this.initRender();
    }
    initRender() {
        
    }
    initLogic() {

    }
    reset() {

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

    cmds: null
}
