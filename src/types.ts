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
    lastLightTurn: number;
}

export interface MyDrone extends Drone {
    idCreatureTarget?: number;
    lastLightTurn: number;
    angle: number;
    scored: boolean;
    goDownDone: boolean;
    mission: string;
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
