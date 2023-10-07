import { SysProxy } from "../data/base/SysProxy";
import { EnumDbName } from "../enum/EnumDbName";
import { Handler } from "../util/Handler";
import { DataManager } from "../data/base/DataManager";
import { DataHash } from "../data/base/DataHash";

import { GameConfig } from "./GameConfig";


export class GameDataManager {
    private static _instance: GameDataManager = null;
    static _pathHash: object = {};

    static get inst(): GameDataManager {
        return GameDataManager._instance || (GameDataManager._instance = new GameDataManager());
    }

    static setPathHash(key, text) {
        GameDataManager._pathHash[key] = text;
    }

    constructor() {
    }

    initSys(sysDataInited:Handler) {
        cc.resources.load("sysData/" + GameConfig.lanType + "/data" , cc.TextAsset, (err, bufferAsset:cc.TextAsset) => {
            this.onSysDataloadComplete(bufferAsset);
            sysDataInited.run();
        }); 
    }

    onSysDataloadComplete(txtAsset:cc.TextAsset) {        
        let fileInfos:object = JSON.parse(txtAsset.text);
        let fileDataList: object = new Object();
        for (let fileName in fileInfos) {
        	let fileInfo = fileInfos[fileName];
        	let fileData: Object = JSON.parse(fileInfo);
        	fileDataList[fileName] = fileData;
        }
        GameDataManager.setPathHash('gameData', fileDataList);
        this.initSysData();
    }

    initSysData() {
        this.registSysData(EnumDbName.st_lan, 'st_lan');
        this.registSysData(EnumDbName.st_extract, 'st_extract');
        this.registSysData(EnumDbName.st_raid, 'st_raid');
        this.registSysData(EnumDbName.st_story, 'st_story');
        this.registSysData(EnumDbName.st_house, 'st_house');
        this.registSysData(EnumDbName.st_item, 'st_item');
        this.registSysData(EnumDbName.st_smith, 'st_smith');
        this.registSysData(EnumDbName.st_hero, 'st_hero');
    }

    /**
     * 静态数据安装
     */
    private registSysData(name: string, data: any): void {
        DataManager.inst.registSysDataHash(name, GameDataManager._pathHash['gameData'][data]);
    }

    /**
     * 获取数据表 
     */
    public getDataHash(name: string): DataHash {
        return DataManager.inst.getDataHash(name);
    }

    // -- 数据代理管理 -- //
    private _proxyPool: object = {};
    // -- 数据代理缓存 -- //
    public registerProxy(key: string, proxy: any) {
        if (!this._proxyPool.hasOwnProperty(key)) {
            this._proxyPool[key] = proxy;
        }
    }
}