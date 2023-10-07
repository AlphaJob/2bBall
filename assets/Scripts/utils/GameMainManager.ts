import GameMain from "../GameMain";
import { LocAction } from "../net/action/LocAction";
import { GameConfig } from "./GameConfig";
import { Handler } from "./Handler";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameMainManager {
    private static _instance: GameMainManager = null;
    static get instance(): GameMainManager {
        if (this._instance == null) {
            this._instance = new GameMainManager();
        }
        return this._instance;
    }

    private background: cc.Node;//MainPanel
    private center: cc.Node;//stagePanel  battlePanel
    private top: cc.Node;//confirmPanel
    private popup: cc.Node;//msg

    gameM: GameMain;
    // 主页
    private mainPanel: cc.Node;
    private battlePanel: cc.Node;

    private _currentMusic = -1;

    init(gameMain: GameMain) {
        this.gameM = gameMain;
        this.background = this.gameM.node.getChildByName('background');
        this.center = this.gameM.node.getChildByName('center');
        this.top = this.gameM.node.getChildByName('top');
        this.popup = this.gameM.node.getChildByName('popup');
        this.loading = this.popup.getChildByName('loading');
        this.loading.active = false;

        LocAction.getsoundsetting(Handler.create(this, this.soundSettingback));
    }

    soundSettingback(soundinfo) {
        GameConfig.soundOn = soundinfo.soundOn;
        GameConfig.musicon = soundinfo.musicon;
        // this.playMusic();
    }

    private loading: cc.Node;
    showLoading() {
        this.loading.active = true;
    }

    hideLoading() {
        this.loading.active = false;
    }

    playNormalMusic() {
        this._currentMusic != -1 && cc.audioEngine.stop(this._currentMusic);

        if (this.gameM.lobbyBg) {
            this._currentMusic = cc.audioEngine.play(this.gameM.lobbyBg, true, 1);
            return;
        }
        cc.loader.loadRes("audio/bgm_casual", cc.AudioClip, (_err, clipAsset: cc.AudioClip) => {
            if (clipAsset) {
                this._currentMusic = cc.audioEngine.play(clipAsset, true, 1);
            }
        });
    }

    playBattleMusic() {
        this._currentMusic != -1 && cc.audioEngine.stop(this._currentMusic);
        if (this.gameM.gameBg) {
            this._currentMusic = cc.audioEngine.play(this.gameM.gameBg, true, 1);
            return;
        }
        cc.loader.loadRes("audio/dungeon", cc.AudioClip, (_err, clipAsset: cc.AudioClip) => {
            if (clipAsset) {
                this._currentMusic = cc.audioEngine.play(clipAsset, true, 1);
            }
        });
    }

    playButtonClick() {
        cc.loader.loadRes("audio/button", cc.AudioClip, (_err, clipAsset: cc.AudioClip) => {
            if (clipAsset) {
                cc.audioEngine.playEffect(clipAsset, false);
            }
        });
    }

    showMainPanel(isMusic: boolean = true) {
        if (this.mainPanel) {
            this.mainPanel.active = true;
            // this.mainPanel.getComponent('MainPanel').setBg();
        } else {
            this.getBundle('battle', 'mainPanel', Handler.create(this, () => {
                let panel = cc.instantiate(cc.assetManager.getBundle("battle").get("mainPanel") as cc.Prefab);
                this.background.addChild(panel);
                this.mainPanel = panel;
            }));
        }
    }

    goLoginPanel() {
        this.getBundle('gameui', 'loginPanel', Handler.create(this, () => {
            let panel = cc.instantiate(cc.assetManager.getBundle("gameui").get("battlePanel") as cc.Prefab);
            this.center.addChild(panel);
        }))
    }


    showLobbyPanel() {
        this.getBundle('gameui', 'lobbyPanel', Handler.create(this, () => {
            let panel = cc.instantiate(cc.assetManager.getBundle("gameui").get("lobbyPanel") as cc.Prefab);
            this.center.addChild(panel);
        }))
    }

    showHelpPanel() {
        this.getBundle('gameui', 'helpPanel', Handler.create(this, () => {
            let panel = cc.instantiate(cc.assetManager.getBundle("gameui").get("helpPanel") as cc.Prefab);
            this.center.addChild(panel);
        }))
    }

    showBattlePanel() {
        this.getBundle('battle', 'battlePanel', Handler.create(this, () => {
            let panel = cc.instantiate(cc.assetManager.getBundle("battle").get("battlePanel") as cc.Prefab);
            this.center.addChild(panel);
            cc.audioEngine.stopAll();
            // this._currentMusic !=-1 && cc.audioEngine.stop(this._currentMusic);
            // cc.loader.loadRes("audio/BGM_BATTLE" , cc.AudioClip, (_err,clipAsset:cc.AudioClip) => {
            //     if(clipAsset) {
            //         this._currentMusic = cc.audioEngine.play(clipAsset,true,1);
            //     }
            // });
        }));
    }

    showConfirmPanel(info, cb: Handler = null) {
        this.getBundle('gameui', 'ui/confirmPanel', Handler.create(this, () => {
            let panel = cc.instantiate(cc.assetManager.getBundle("gameui").get("ui/confirmPanel") as cc.Prefab);
            panel.getComponent('ConfirmPanel').showMsg(info);
            panel.getComponent('ConfirmPanel').setCallback(cb);
            this.popup.addChild(panel);
        }))
    }

    showSettingPanel() {
        this.getBundle('gameui', 'ui/settingPanel', Handler.create(this, () => {
            let panel = cc.instantiate(cc.assetManager.getBundle("gameui").get("ui/settingPanel") as cc.Prefab);
            this.top.addChild(panel);
        }))
        // let panel = cc.instantiate(cc.assetManager.getBundle("gameui").get("ui/settingPanel") as cc.Prefab);
        // this.top.addChild(panel);
    }

    showResultPanel() {
        this.getBundle('battle', 'resultPanel', Handler.create(this, () => {
            let panel = cc.instantiate(cc.assetManager.getBundle("battle").get("resultPanel") as cc.Prefab);
            this.top.addChild(panel);
        }));
    }

    showMsgLabel(info) {
        this.getBundle('battle', 'tips', Handler.create(this, () => {
            let panel = cc.instantiate(cc.assetManager.getBundle("battle").get("tips") as cc.Prefab);
            this.top.addChild(panel);
            panel.getComponent('LabelTips').showMsg(info);
        }))
    }

    showMsgStone(info) {
        this.getBundle('battle', 'prefab/tips_loot', Handler.create(this, () => {
            let panel = cc.instantiate(cc.assetManager.getBundle("battle").get("prefab/tips_loot") as cc.Prefab);
            this.top.addChild(panel);
            // panel.getComponent('StoneTips').showMsg(info);
        }))
    }

    // 加载资源回调
    getBundle(bundlename, resname, cb: Handler) {
        let bundle = cc.assetManager.getBundle(bundlename);
        bundle.load(resname, cc.Prefab, (err, res: cc.Prefab) => {
            if (err) {
                cc.log(err);
            }
            else {
                cb.run();
            }
        });
    }
}