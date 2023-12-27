import {CreatureVisible, Drone, Game, MyDrone} from "./types";
import {fn} from "./functions/utils";
import {initGame, readInputs} from "./functions/parseInputs";
import {fnPoints} from "./functions/points";
import {fnTarget} from "./functions/targets";
import {fnAvoid} from "./functions/avoid";
import {fnFaireFuir} from "./functions/faireFuir";
import {future} from "./functions/future";
import {down} from "./functions/down";

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

let lastGame: Game = {...game};

export let TYPES = [0, 1, 2];
export let COLORS = [0, 1, 2, 3];

initGame();

while (1 === 1) {

    game.turnId++;

    readInputs();

    const invisibleCreatures = lastGame.creaturesVisibles
        .filter(c => !game.creaturesVisibles.map(fn.id).includes(c.creatureId));

    game.creaturesVisibles
        .map(c => future.computeNextPosition(c, game));

    lastGame.creaturesVisibles
        .map(future.applyNextPosition)
        .map(c => future.computeNextPosition(c, game));

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

        let distanceToMove = 600;

        // compute state

        if (d.state === 'DOWN' && d.y >= 8500) {
            d.state = 'SEARCH';
        }

        if (targets.length === 0) {
            d.state = 'FINISHED';
        }

        if (d.state === 'FINISHED' && targets.length > 0) {
            d.state = 'SEARCH';
        }

        if (d.state === 'SCORE' && d.y <= 500) {
            d.state = 'SEARCH';
            d.angle = 90;
        }

        if (pointsIfIUpNow > pointsVsIfUpAtEnd) {
            // d.state = 'SCORE';
        }

        if (d.y <= 500 || d.emergency) {
            d.idCreatureTarget = null;
        }

        // Compute angle

        if (d.state === 'DOWN') {
            d.idCreatureTarget = null;
            d.angle = down.getDownAngle(d)
            debug.push('DOWN');
        }

        if (d.state === 'SEARCH' && !d.emergency) {
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


        // FAIRE PEUR

        const fairePeurA = [...game.creaturesVisibles, ...invisibleCreatures]
            .filter(fn.isGentil)
            .filter(c => fnFaireFuir.estProcheDeMoi(d, c))
            .filter(c => !fnFaireFuir.isScannedByVs(c.creatureId))
            .filter(c => fnFaireFuir.ilEstPretDuBord(future.getFuturePosition(c)))
            .filter(c => !future.vaDispaitre(c))

        for (const s of fairePeurA) {
            const pos = fnFaireFuir.getPositionToBouh(s);
            d.angle = fn.moduloAngle(fn.angleTo(d, pos));
            distanceToMove = fn.getDistance(d, pos);
            debug.push('BOU', s.creatureId);
        }

        // ÉVITER MONSTRES

        const monsters = [...game.creaturesVisibles, ...invisibleCreatures]
            .filter(fn.isMechant)
            .filter(c => fn.getDistance(c, d) < 3000);

        const angleAvoiding = fnAvoid.bestAngleAvoiding(monsters, d, d.angle);
        if (angleAvoiding !== d.angle) {
            debug.push('AVOID');
            d.angle = angleAvoiding;
            distanceToMove = 600;
        }

        // Compute light

        let light = false;

        // On allume la light si ça fait longtemps
        if (game.turnId - d.lastLightTurn >= 3 && d.state !== 'FINISHED') {
            if (d.y > 2500) {
                light = true;
            }
        }

        // SENDING

        let goTo = fn.forward(d, d.angle, distanceToMove);
        d.x = goTo.x;
        d.y = goTo.y;

        if (light) {
            debug.push('LIGHT');
            d.lastLightTurn = game.turnId;
        }

        console.log('MOVE ' + d.x + ' ' + d.y + ' ' + (light?1:0) + ' ' + debug.join(' '))

    }

    lastGame = {...game};
}
