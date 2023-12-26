export interface Drone {
    idx: number;
    droneId: number;
    x: number;
    y: number;
    emergency: boolean;
    battery: number;
    creaturesScanned?: number[];
    lastLightTurn?: number; // TODO
}

export interface MyDrone extends Drone {
    idCreatureTarget?: number;
    state?: string;
    lastLightTurn: number;
    angle: number;
}

export interface CreatureMeta {
    creatureId: number;
    color: number;
    type: number;
}

export interface CreatureVisible extends CreatureMeta {
    creatureId: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    nextAngle?: number;
    nextDistance?: number;
    neerestDrone?: number;
}

export interface CreatureValidated {
    creatureId: number;
    turn: number;
}

export interface Radar {
    creatureId: number;
    droneId: number;
    direction: string;
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
    radars: Radar[];
}
