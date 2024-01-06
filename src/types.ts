export interface Point {
    x: number;
    y: number;
}

export interface Drone extends Point {
    idx: number;
    droneId: number;
    emergency: boolean;
    battery: number;
    creaturesScanned?: number[];
    lightIsOn: boolean;
    isUpping: boolean;
    imLeft: boolean;
}

export interface MyDrone extends Drone {
    angle: number;
    scored: boolean;
    goDownDone: boolean;
    mission: string;
    lastLightTurn: number;
}

export interface VirtualMonster extends Point {
    id: number;
}

export interface CreatureMeta {
    creatureId: number;
    color: number;
    type: number;
}

export interface CreatureVisible extends CreatureMeta, Point {
    creatureId: number;
    vx: number;
    vy: number;
    nextAngle?: number;
    nextDistance?: number;
}

export interface CreatureInvisible extends CreatureVisible {
    lastTurnSeen: number;
}

export interface CreatureValidated {
    creatureId: number;
    turn: number;
}

export enum Direction {
    BL = "BL",
    BR = "BR",
    TL = "TL",
    TR = "TR",
};

export interface Radar {
    creatureId: number;
    droneId: number;
    direction: Direction;
}


export interface Bbox {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
}

export interface CreatureBbox extends Bbox {
    creatureId: number;
}

export interface Game {
    turnId: number;
    myDrones: MyDrone[];
    vsDrones: Drone[];
    creaturesMetas: Map<number, CreatureMeta>;
    creaturesMetasArr: CreatureMeta[];
    creaturesVisibles: CreatureVisible[];
    creaturesValidated: CreatureValidated[];
    vsCreaturesValidates: CreatureValidated[];
    creatureBboxes: CreatureBbox[];
    radars: Radar[];
}
