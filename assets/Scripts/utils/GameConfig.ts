export class GameConfig {
    static soundOn: boolean = true;
    static musicon: boolean = true;
    static designwidth: number = 1920;
    static designheight: number = 1080;
    static gameUiResNum = 71;
    static battleResNum = 566;
    static wsIp;
    static port;

    static type = 3;
    static isDev: boolean;
    static init() {
        switch (this.type) {
            case 1:
                //内网开发
                GameConfig.wsIp = '192.168.31.6';
                GameConfig.port = '9007';
                GameConfig.isDev = true;
                break;
            case 2:
                //外网测试
                GameConfig.wsIp = '124.221.144.95';
                GameConfig.port = '9007';
                GameConfig.isDev = true;
                break;
            case 3:
                //外网正式
                GameConfig.wsIp = '124.221.144.95';
                GameConfig.port = '9007';
                GameConfig.isDev = false;
                break;
            default:
                break;
        }
    }

    static colorbg: string = '#041615';
    static getTextColorByIndex(index: number) {
        let colorStr = '#C0B7A0';
        switch (index) {
            case 2:
                colorStr = '#FF5252'
                break;
            case 3:
                colorStr = '#8DD000'
                break;
            case 4:
                colorStr = '#3FC2FF'
                break;
            case 5:
                colorStr = '#E1E1E1'
                break;
            case 6:
                colorStr = '#D27AFF'
                break;
            case 7:
                colorStr = '#969696'
                break;
            case 8:
                colorStr = '#ECA900'
                break;
            default:
                break;
        }
        return colorStr;
    }

    static newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
