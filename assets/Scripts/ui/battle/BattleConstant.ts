export class GameState {
    static GS_SKILL = 1;
    static GS_AIM = 2;
    static GS_PLAY = 3;
    static GS_PUSH = 4;
    static GS_FINISH = 5;
    static GS_DEBUG = 6;
    static GS_GROUP_DEBUG = 7;
}

export class BallStatus {
    static CREATING = 1;
    static MOVING = 2;
    static MOVED = 3;
    static DESTROY = 4;
}