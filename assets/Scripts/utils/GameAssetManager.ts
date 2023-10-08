import { AssetManager, assetManager } from "cc";

export class GameAssetManager {
    private static _instance: GameAssetManager = null;
    static get instance(): GameAssetManager {
        if (this._instance == null) {
            this._instance = new GameAssetManager();
        }
        return this._instance;
    }

    //加载bundle
    loadBundle(name) {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle(name, (err, bundle: AssetManager.Bundle) => {
                if (err) {
                    return reject(err);
                }
                resolve(bundle);
            });
        });
    }

    //加载bundle下的所有资源
    loadBundleAllAsset(bundleName: string, onProgress: (finish: number, total: number, item: any) => void, onComplete: (err: Error, res: any) => void) {
        let bundle = assetManager.getBundle(bundleName);
        bundle.loadDir("", (finish, total, item) => {
            onProgress(finish, total, item);
        }, (err, res) => {
            onComplete(err, res);
        });
    }

    //加载bundle下的单个资源
    loadBundleAsset(bundleName:string, assetName:string, onComplete: (err: Error, res: any) => void) {
        let bundle = assetManager.getBundle(bundleName);
        bundle.load(assetName, (err, res) => {
            onComplete(err, res);
        });
    }

    //获取bundle下的单个资源 取前需要先加载
    getBundleAsset(bundleName:string, assetName:string) {
        return new Promise((resolve, reject) => {
            let bundle = assetManager.getBundle(bundleName);
            let asset = bundle.get(assetName);
            if (asset) {
                resolve(asset);
            }else {
                console.error('bundleName:', bundleName, 'assetName:', assetName, 'not found');
                this.loadBundleAsset(bundleName, assetName, (err, res) => {
                    if (err) {
                        reject(err);
                    }
                   resolve(res);
                });
            }
        });
       
    }
}