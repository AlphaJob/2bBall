export class GameConstant {
    static HERO_TYPE_NPC1 = "npc1";
    static HERO_TYPE_NPC2 = "npc2";
    static HERO_TYPE_ICEMAGE = "icemage";
    static HERO_TYPE_HOOKER = "hooker";
    static HERO_TYPE_PRIEST = "priest";
    static HERO_TYPE_FIREMAGE = "firemage";
    static HERO_TYPE_FIGHTER = "fighter";
    static HERO_TYPE_ARCHER = "archer";
    static HERO_TYPE_UNKNOW = "unknow";
    constructor() { }
}

export enum ERole {
    icemage,
    firemage,
    hooker,
    archer,
    fighter,
    priest,
    npc1,
    npc2,
}

export class HeroEventType {
    static HERO_DEAD = "hero_dead";
    static HERO_RELIVE = "hero_reLive";
    static HERO_GO_TELEPORT = "hero_go_teleport";
    static HERO_FIRE_CHANGE_SKILL = "hero_fire_change_skill";
    static HERO_NAILING_HERO_BE_FIRED = "hero_nailing_hero_be_fired";
    static HERO_BOARD_KILL = "hero_board_kill";
}

export class ItemEventType {
    static ITEM_BUTTON_PUSHED = "item_button_pushed";
    static ITEM_BUTTON_UNPUSHED = "item_button_unPushed";
    static ITEM_BUTTON_DESTROYED = "item_button_destroyed";
    static ITEM_BUTTON_TRIGGERED = "item_button_triggered";

    static ITEM_GO_CHANGE_BOARD_STATE = "item_go_change_board_state";
}

export class OpertionEventType {
    static OP_TRIGGER_RIGHT = "op_trigger_right";
    static OP_TRIGGER_LEFT = "op_trigger_left";
    static OP_TRIGGER_JUMP = "op_trigger_jump";
    static OP_TRIGGER_SKILL = "op_trigger_skill";
    static OP_TRIGGER_CHANGE_HERO = "op_trigger_change_hero";
    static OP_TRIGGER_STOP_WALK = "op_trigger_stop_walk";
    static OP_TRIGGER_TEST = "op_trigger_test";
}
