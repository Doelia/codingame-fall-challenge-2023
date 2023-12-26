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
