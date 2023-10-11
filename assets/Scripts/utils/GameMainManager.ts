import { _decorator, assetManager, instantiate, log, Node, Prefab } from 'cc';
import { GameMain } from '../GameMain';
import { GameAssetManager } from './GameAssetManager';
const { ccclass, property } = _decorator;

@ccclass('GameMainManager')
export class GameMainManager {   
    private static _instance: GameMainManager = null;
    static get instance(): GameMainManager {
        if (this._instance == null) {
            this._instance = new GameMainManager();
        }
        return this._instance;
    }

    private background: Node;//MainPanel
    private center: Node;//stagePanel  battlePanel
    private top: Node;//confirmPanel
    private popup: Node;//msg

    private loading:Node;
    showLoading() {
       this.loading.active = true;
    }

    hideLoading() {
        this.loading.active = false;
    }

    gameM:GameMain = null;

    init(gameMain:GameMain) {
        this.gameM = gameMain;

        this.background = gameMain.node.getChildByName('background');
        this.center = gameMain.node.getChildByName('center');
        this.top = gameMain.node.getChildByName('top');
        this.popup = gameMain.node.getChildByName('popup');

        this.loading = this.popup.getChildByName('waiting');
        this.loading.active = false;

        log('GameMainManager init');
    }

    showGamePanel (isMusic:boolean = true) {
        // if(this.mainPanel) {
        //     this.mainPanel.active = true;
        //     // this.mainPanel.getComponent('MainPanel').setBg();
        // }else {
            GameAssetManager.instance.getBundleAsset('Battle', 'GamePanel').then(() => {
                let panel = instantiate(assetManager.getBundle("Battle").get("GamePanel") as Prefab);
                this.background.addChild(panel);
            });
        // }      
    }
}


