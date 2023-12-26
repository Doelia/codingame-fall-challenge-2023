
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
import {CreatureVisible, MyDrone} from "../types";
import {fn} from "./utils";
import {game} from "../main";

export const fnAvoid = {

    getFutureMonsterPosition(monster: CreatureVisible, projection=1) {
        return fn.forward(monster, monster.nextAngle, projection*monster.nextDistance);
    },

    bestAngleAvoiding(d: MyDrone, angleWanted: number) {

        const monsters = game.creaturesVisibles
            .filter(c => c.type === -1)
            .filter(c => fn.getDistance(c, d) < 2000)
            .sort((a, b) => fn.getDistance(a, d) - fn.getDistance(b, d))

        function isGoodAngle(angle: number) {
            return getDangerours(monsters, d, angle).length <= 0;
        }

        // ILs sont dangereux s'ils sont capables de me manger au prochain tour
        function getDangerours(monsters, d, angle) {
            let PAS = 100;
            return monsters.filter(monster => {
                for (let i = 0; i <= PAS; i++) {
                    let nextMyPosition = fn.forward(d, angle, i/PAS * 600);
                    let nextPositionMonster = fnAvoid.getFutureMonsterPosition(monster, i/PAS)
                    let distance = fn.getDistance(nextPositionMonster, nextMyPosition);
                    if (distance <= 510) {
                        return true;
                    }
                }
                return false;
            });
        }

        for (let i = 0; i <= 180; i++) {
            let angle = fn.moduloAngle(angleWanted + i);
            if (isGoodAngle(angle)) {
                return angle;
            }
            angle = fn.moduloAngle(angleWanted - i);
            if (isGoodAngle(angle)) {
                return angle;
            }
        }

        return angleWanted;
    },

}

import {readline} from "../polyfill";
import {fn} from "./utils";
import {game} from "../main";

export function initGame() {
    const creatureCount = parseInt(readline());
    for (let i = 0; i < creatureCount; i++) {
        const inputs = readline().split(' ');
        const creatureId = parseInt(inputs[0]);
        const color = parseInt(inputs[1]);
        const type = parseInt(inputs[2]);

        const creature = {creatureId, color, type};
        game.creaturesMetas.set(creatureId, creature);
        game.creaturesMetasArr.push(creature);
    }
}

export function readInputs() {

    game.turnId++;

    const myScore = parseInt(readline());
    const vsScore = parseInt(readline());

    // Créatures validées
    const myScanCount = parseInt(readline());
    for (let i = 0; i < myScanCount; i++) {
        const creatureId = parseInt(readline());
        if (!game.creaturesValidated.map(fn.id).includes(creatureId)) {
            game.creaturesValidated.push({
                creatureId,
                turn: game.turnId,
            });
        }
    }
    const foeScanCount = parseInt(readline());
    for (let i = 0; i < foeScanCount; i++) {
        const creatureId = parseInt(readline());
        if (!game.vsCreaturesValidates.map(fn.id).includes(creatureId)) {
            game.vsCreaturesValidates.push({
                creatureId,
                turn: game.turnId,
            });
        }
    }

    // Mes drones
    const myDroneCount = parseInt(readline());
    for (let i = 0; i < myDroneCount; i++) {
        const inputs = readline().split(' ');
        const droneId = parseInt(inputs[0]);
        const x = parseInt(inputs[1]);
        const y = parseInt(inputs[2]);
        const emergency = parseInt(inputs[3]) === 1;
        const battery = parseInt(inputs[4]);

        let d = game.myDrones.find(v => v.droneId === droneId);
        if (d) {
            d.x = x;
            d.y = y;
            d.emergency = emergency;
            d.battery = battery;
            d.creaturesScanned = [];
        } else {
            game.myDrones.push({
                idx: i,
                droneId, x, y, emergency, battery,
                lastLightTurn: 0,
                angle: 90,
                idCreatureTarget: null,
                creaturesScanned: [],
                state: 'DOWN',
            });
        }


        // if (emergency) {
        // d.creaturesScanned = [];
        // }

    }

    // Ses drones
    const foeDroneCount = parseInt(readline());
    for (let i = 0; i < foeDroneCount; i++) {
        var inputs = readline().split(' ');
        const droneId = parseInt(inputs[0]);
        const x = parseInt(inputs[1]);
        const y = parseInt(inputs[2]);
        const emergency = parseInt(inputs[3]) === 1;
        const battery = parseInt(inputs[4]);

        let d = game.vsDrones.find(v => v.droneId === droneId);
        if (d) {
            d.x = x;
            d.y = y;
            d.emergency = emergency;
            d.battery = battery;
            d.creaturesScanned = [];
        } else {
            game.vsDrones.push({ idx: i, droneId, x, y, emergency, battery, creaturesScanned: [] });
        }

        // if (emergency) {
        //     d.creaturesScanned = [];
        // }
    }

    // Créatures scannées
    const droneScanCount = parseInt(readline());
    for (let i = 0; i < droneScanCount; i++) {
        const inputs = readline().split(' ');
        const droneId = parseInt(inputs[0]);
        const creatureId = parseInt(inputs[1]);
        const d = [...game.myDrones, ...game.vsDrones].find(d => d.droneId === droneId);
        d.creaturesScanned.push(creatureId);
    }

    // Créatures visibles
    game.creaturesVisibles = [];
    const visibleCreatureCount = parseInt(readline());
    for (let i = 0; i < visibleCreatureCount; i++) {
        const inputs = readline().split(' ');
        const creatureId = parseInt(inputs[0]);
        const x = parseInt(inputs[1]);
        const y = parseInt(inputs[2]);
        const vx = parseInt(inputs[3]);
        const vy = parseInt(inputs[4]);

        game.creaturesVisibles.push({ ...game.creaturesMetas.get(creatureId), x, y, vx, vy });
    }

    const radarBlipCount = parseInt(readline());
    game.radars = [];
    for (let i = 0; i < radarBlipCount; i++) {
        const inputs = readline().split(' ');
        const droneId = parseInt(inputs[0]);
        const creatureId = parseInt(inputs[1]);
        const radar = inputs[2];

        let creature = game.creaturesMetas.get(creatureId);
        game.radars.push({
            ...creature,
            droneId,
            direction: radar,
        })
    }
}

export function compute() {

    for (let d of game.myDrones) {
        if (d.y <= 500) {
            // d.creaturesScanned = [];
            d.idCreatureTarget = null;
        }
    }

    // Compute nextAngle and nextDistance for monsters
    for (let m of game.creaturesVisibles.filter(c => game.creaturesMetas.get(c.creatureId).type === -1)) {

        const allDrones = [...game.myDrones, ...game.vsDrones];

        let neerestDrone = allDrones
            .filter(d => !d.emergency)
            .filter(d => {
                let lightPuissance = d.lastLightTurn === game.turnId - 1 ? 2000 : 800; // TODO
                return fn.getDistance(d, m) < lightPuissance
            })
            .sort((a, b) => fn.getDistance(a, m) - fn.getDistance(b, m))[0];

        if (!neerestDrone) {
            m.nextAngle = fn.moduloAngle(fn.angleTo(m, { x: m.x + m.vx, y: m.y + m.vy }));
            m.nextDistance = Math.sqrt(Math.pow(m.vx, 2) + Math.pow(m.vy, 2));
        } else {
            m.nextAngle =  fn.moduloAngle(fn.angleTo(m, neerestDrone));
            m.nextDistance = 540;
            m.neerestDrone = neerestDrone.droneId;
        }

    }

}
import {fn} from "./utils";
import {COLORS, game, TYPES} from "../main";

export const fnPoints = {

    pointsIfIUpNow: function(myScansIds: number[]) {

        const myturnToUp = Math.max(...game.myDrones.map(fn.turnToUp));

        return fnPoints.computePoints(
            [
                ...game.creaturesValidated,
                ...myScansIds.map(id => ({creatureId: id, turn: game.turnId + myturnToUp})),
            ],
            game.vsCreaturesValidates
        );
    },

    pointsVsIfUpAtEnd: function(myScansIds: number[], vsScansIds: number[]) {

        const inRadarsIds = game.radars.map(fn.id);

        let stay = game.creaturesMetasArr
            .map(fn.id)
            .filter(v => game.creaturesMetas.get(v).type !== -1)
            .filter(v => !game.vsCreaturesValidates.map(fn.id).includes(v))
            .filter(v => inRadarsIds.includes(v))
            .filter(v => !vsScansIds.includes(v))
            .map(id => ({creatureId: id, turn: 200}));

        const myturnToUp = Math.max(...game.myDrones.map(fn.turnToUp));
        const vsturnToUp = Math.max(...game.vsDrones.map(fn.turnToUp));

        return fnPoints.computePoints(
            [
                ...game.vsCreaturesValidates,
                ...vsScansIds.map(id => ({creatureId: id, turn: game.turnId + vsturnToUp})),
                ...stay,
            ],
            [
                ...game.creaturesValidated,
                ...myScansIds.map(id => ({creatureId: id, turn: game.turnId + myturnToUp})),
            ],
        );
    },

    pointOfFish(idCreature, isFirst) {
        return (game.creaturesMetas.get(idCreature).type + 1) * (isFirst ? 2 : 1);
    },

    computePoints(validated, vsValidated) {

        let points = 0;

        for (let f of validated) {
            let {creatureId} = f;
            const isVsValidated = vsValidated.find(v => v.creatureId === creatureId);
            const imFirst = !isVsValidated || f.turn < isVsValidated.turn;
            points += fnPoints.pointOfFish(creatureId, imFirst);
        }

        for (let type of TYPES) {
            let metaNOfType = game.creaturesMetasArr.filter(v => v.type === type).length;
            let fishesOfType = validated.filter(v => game.creaturesMetas.get(v.creatureId).type === type);
            let vsFishesOfType = vsValidated.filter(v => game.creaturesMetas.get(v.creatureId).type === type);

            if (metaNOfType === fishesOfType.length) {
                points += 4;

                if (vsFishesOfType.length < metaNOfType) {
                    points += 4;
                } else {
                    const jaiToutAuTour = Math.max(fishesOfType.map(v => v.turn));
                    const ilAToutAuTour = Math.max(vsFishesOfType.map(v => v.turn));
                    if (jaiToutAuTour < ilAToutAuTour) {
                        points += 4;
                    }
                }

            }
        }

        for (let color of COLORS) {
            let metaNOfColor = game.creaturesMetasArr.filter(v => v.color === color).length;
            let fishesOfColor = validated.filter(v => game.creaturesMetas.get(v.creatureId).color === color);
            let vsFishesOfColor = vsValidated.filter(v => game.creaturesMetas.get(v.creatureId).color === color);

            if (metaNOfColor === fishesOfColor.length) {
                points += 3;

                if (vsFishesOfColor.length < metaNOfColor) {
                    points += 3;
                } else {
                    const jaiToutAuTour = Math.max(fishesOfColor.map(v => v.turn));
                    const ilAToutAuTour = Math.max(vsFishesOfColor.map(v => v.turn));
                    if (jaiToutAuTour < ilAToutAuTour) {
                        points += 3;
                    }
                }

            }
        }

        return points;

    }
}
import {fn} from "./utils";
import {game} from "../main";

export const fnTarget = {
    getTargets(d, myScansIds) {

        const dontScanIt = [
            ...myScansIds,
            ...game.creaturesValidated.map(fn.id),
        ];

        return game.radars
            .filter(r => r.droneId === d.droneId)
            .filter(r => game.creaturesMetas.get(r.creatureId).color !== -1)
            .filter(r => !dontScanIt.includes(r.creatureId))
            .filter(r => !game.myDrones.filter(v => v.droneId !== d.droneId).map(v => v.idCreatureTarget).includes(r.creatureId)) // Pas déjà pris par un autre drone
            .sort((a, b) => {
                let pa = this.radarToPosition(d, a);
                let pb = this.radarToPosition(d, b);
                return fn.getDistance(pa, d) - fn.getDistance(pb, d);
            })
    },

    radarToAngle: function (d, radar) {
        const target = this.radarToPosition(d, radar);
        return fn.angleTo(d, target);
    },

    translatePositionToFishType(position, fishType) {
        const [min, max] = fn.fishTypeToMinMaxY(fishType);
        return {
            x: position.x,
            y: Math.min(Math.max(position.y, min), max),
        }
    },
    radarDirectionToTarget: function(direction) {
        const PADDING = 500;
        switch (direction) {
            case 'TL': return {x: PADDING, y: 0 };
            case 'TR': return {x: 10000 - PADDING, y: 0};
            case 'BR': return {x: 10000 - PADDING, y: 10000};
            case 'BL': return {x: PADDING, y: 10000};
        }
    },
    radarToPosition: function (d, radar) {
        let target = this.radarDirectionToTarget(radar.direction);
        let fishType = game.creaturesMetas.get(radar.creatureId).type;
        return this.translatePositionToFishType(target, fishType);
    },
}
import {game} from "../main";

export const fn = {
    getDistance: (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)),
    samePoint: (p1, p2) => p1.x === p2.x && p1.y === p2.y,
    fishTypeToMinMaxY: (fishType) => {
        if (fishType === 0) return [2500, 5000];
        if (fishType === 1) return [5000, 7500];
        if (fishType === 2) return [7500, 10000];
    },
    reversePoint: function(p) {
        return { x: -p.x, y: -p.y, }
    },
    toRadians: (degrees) => degrees * Math.PI / 180,
    toDegrees: (radians)  => radians * 180 / Math.PI,
    cos: (degrees) => Math.cos(fn.toRadians(degrees)),
    sin: (degrees) =>  Math.sin(fn.toRadians(degrees)),
    turnAtMost(angle, turn, max=360) {
        if (Math.abs(turn) > max) {
            return angle + (turn > 0 ? max : -max);
        } else {
            return angle + turn;
        }
    },
    moveToAngleAtMost(angle, angleTarget, max=360) {
        let sub = fn.substrateAngles(angleTarget, angle);
        return fn.turnAtMost(angle, sub, max);
    },
    angleTo: (from, to) => fn.toDegrees(Math.atan2(to.y - from.y, to.x - from.x)),
    forward: (p, angle, dist= 600) => ({
        x: Math.max(0, Math.min(9999, Math.round(p.x + fn.cos(angle) * dist))),
        y: Math.max(0, Math.min(9999, Math.round(p.y + fn.sin(angle) * dist))),
    }),
    wiggle: (angle, maxAngle) => fn.moduloAngle(angle + (Math.random() * maxAngle) - (Math.random() * maxAngle)),
    moduloAngle: (angle) => (angle % 360) > 0 ? (angle % 360) : (angle % 360) + 360,
    substrateAngles(h1, h2) {
        if (h1 < 0 || h1 >= 360) {
            h1 = (h1 % 360 + 360) % 360;
        }
        if (h2 < 0 || h2 >= 360) {
            h2 = (h2 % 360 + 360) % 360;
        }
        const diff = h1 - h2;
        if (diff > -180 && diff <= 180) {
            return diff;
        } else if (diff > 0) {
            return diff - 360;
        } else {
            return diff + 360;
        }
    },
    id: (p): number => p.creatureId,
    uniq: ((v, i, a) => a.indexOf(v) === i),
    turnToUp: (d): number => Math.floor((d.y-500) / 600),
}
import {CreatureVisible, Drone, Game, MyDrone} from "./types";
import {fn} from "./functions/utils";
import {compute, initGame, readInputs} from "./functions/parseInputs";
import {fnPoints} from "./functions/points";
import {fnTarget} from "./functions/targets";
import {fnAvoid} from "./functions/avoid";

export const game: Game = {
    turnId: 0,
    myDrones: [],
    vsDrones: [],
    creaturesMetas: new Map(),
    creaturesMetasArr: [],
    creaturesVisibles: [],

    creaturesValidated: [],
    vsCreaturesValidates: [],

    radars: [],
}

export let TYPES = [0, 1, 2];
export let COLORS = [0, 1, 2, 3];

initGame();

while (1 === 1) {

    readInputs();
    compute();

    const myScansIds = game.myDrones.reduce((acc, v) => [...acc, ...v.creaturesScanned], [])
        .filter(v => !game.creaturesValidated.map(fn.id).includes(v)) // Pas utile ?
        .filter(fn.uniq);

    const vsScansIds = game.vsDrones.reduce((acc, v) => [...acc, ...v.creaturesScanned], [])
        .filter(fn.uniq);

    const pointsIfIUpNow = fnPoints.pointsIfIUpNow(myScansIds);
    const pointsVsIfUpAtEnd = fnPoints.pointsVsIfUpAtEnd(myScansIds, vsScansIds);

    let dontScanIt = [
        ...myScansIds,
        ...game.creaturesValidated.map(fn.id),
    ];

    for (let d of game.myDrones) {

        let debug = [];


        const targets = fnTarget.getTargets(d, myScansIds);

        // compute state

        if (d.state === 'DOWN') {
            d.state = 'SEARCH';
        }

        if (targets.length === 0) {
            d.state = 'FINISHED';
        }

        if (d.state === 'SCORE' && d.y <= 500) {
            d.state = 'SEARCH';
            d.angle = 90;
        }

        if (pointsIfIUpNow > pointsVsIfUpAtEnd) {
            d.state = 'SCORE';
        }

        // Compute angle

        if (d.state === 'DOWN') {
            d.idCreatureTarget = null;
            d.angle = 90;
            debug.push('DOWN');
        }

        if (d.state === 'SEARCH') {
            if (
                !d.idCreatureTarget // Plus de target
                || dontScanIt.includes(d.idCreatureTarget)
                || !game.radars.map(fn.id).includes(d.idCreatureTarget) // on le trouve plus sur la map
            ) {
                if (targets.length > 0) {
                    d.idCreatureTarget = targets[0].creatureId;
                }
            }

            debug.push('T=' + d.idCreatureTarget);
            let radarOfTarget = targets.find(r => r.creatureId === d.idCreatureTarget);
            if (radarOfTarget) {
                let angleToTarget = fnTarget.radarToAngle(d, radarOfTarget);
                d.angle = fn.moduloAngle(fn.moveToAngleAtMost(d.angle, angleToTarget, 45));
            }
        }

        if (d.state === 'FINISHED') {
            debug.push('FINISHED');
            d.angle = 270;
        }

        if (d.state === 'SCORE') {
            debug.push('SCORE' + pointsIfIUpNow + '>' + pointsVsIfUpAtEnd);
            d.angle = 270;
        }

        d.angle = fnAvoid.bestAngleAvoiding(d, d.angle);

        // Compute light

        let light = false;

        // On allume la light si ça fait longtemps
        if (game.turnId - d.lastLightTurn >= 2 && d.state !== 'FINISHED') {
            if (d.y > 2000) {
                light = true;
            }
        }

        // SENDING

        let goTo = fn.forward(d, d.angle, 600);

        if (light) {
            debug.push('LIGHT');
            d.lastLightTurn = game.turnId;
        }

        console.log('MOVE ' + goTo.x + ' ' + goTo.y + ' ' + (light?1:0) + ' ' + debug.join(' '))

    }
}
