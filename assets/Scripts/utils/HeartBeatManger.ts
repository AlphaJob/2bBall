import { CNet } from "../net/CNet";
import { PackageOut } from "../net/PackageOut";
import { Handler } from "./Handler";

export default class HeartBeatManager {
    private static _instance: HeartBeatManager = null;
    static get instance(): HeartBeatManager {
      if (this._instance == null) {
        this._instance = new HeartBeatManager();
      }
      return this._instance;
    }
    timeOut: number = 50000; //心跳频率 5秒
    private timeObj: any = null;
    private serverTimeObj: any = null;
 
    init() { //初始化
        cc.log("HeartBeat 初始化完成");        this.timeOut = 50000;
    }
 
    //启动
    start() {
        //清除延时器
        // cc.log('HeartBeat start');
        this.close();
        this.timeObj = setTimeout(() => {
            //发送消息，服务端返回信息，即表示连接良好，可以在socket的onmessage事件重置心跳机制函数
            let heartBeaPOut:PackageOut = PackageOut.pack(tile_cmd.TileCmd.CHeartBeat, tile_msg.CGameInfo.encode(tile_msg.CGameInfo.create()).finish());
            CNet.call(heartBeaPOut, Handler.create(this, this.start));
 
            //定义一个延时器等待服务器响应，若超时，则关闭连接，重新请求server建立socket连接
            // this.serverTimeObj = setTimeout(() => {
            //     CNet.reConnect();
            // }, this.timeOut);
        }, this.timeOut)
    }
 
    //关闭
    close() {
        this.timeObj && clearTimeout(this.timeObj);
        this.serverTimeObj && clearTimeout(this.serverTimeObj);
    }
}
