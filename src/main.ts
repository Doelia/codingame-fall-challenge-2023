import {CreatureVisible, Drone, Game, MyDrone} from "./types";
import {fn} from "./functions/utils";
import {initGame, readInputs} from "./functions/parseInputs";
import {fnPoints} from "./functions/points";
import {fnTarget} from "./functions/targets";
import {fnAvoid} from "./functions/avoid";
import {fnFaireFuir} from "./functions/faireFuir";
import {future} from "./functions/future";
import {down} from "./functions/down";
import {fnBbox} from "./functions/bbox";
import {fnLight} from "./functions/light";

export const game: Game = {
    turnId: 0,
    myDrones: [],
    vsDrones: [],
    creaturesMetas: new Map(),
    creaturesMetasArr: [],
    creaturesVisibles: [],

    creatureBboxes: [],

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

    lastGame.creaturesVisibles
        .map(future.applyNextPosition)
        .map(c => future.computeNextPosition(c, game));

    lastGame.creatureBboxes = lastGame.creatureBboxes.map(fnBbox.enlargeWithMovement);

    game.creaturesVisibles
        .map(c => future.computeNextPosition(c, game));

    const creaturesInvisible = lastGame.creaturesVisibles
        .filter(c => !game.creaturesVisibles.map(fn.id).includes(c.creatureId));

    const [pointsIfIUpNow, pointsVsIfUpAtEnd ] = fnPoints.pointsIfIUpNow(lastGame);
    console.error(pointsIfIUpNow, 'vs', pointsVsIfUpAtEnd);

    game.creatureBboxes = fnBbox.compute(game, lastGame);
    // console.error('bbox', game.creatureBboxes.map(b => ({ ...b, ...fnBbox.getCenter(b) })))

    const targets = fnTarget.getTargets();

    // Missions accompiles
    for (let d of game.myDrones) {

        const oldD = lastGame.myDrones.find(v => v.droneId === d.droneId);

        if (d.y >= 7500) {
            d.goDownDone = true;
        }

        if (oldD.mission === 'SCORE' && d.y <= 500) {
            d.scored = true;
            d.goDownDone = true;
        }

        d.mission = null;
    }

    let [t1, t2] = fnTarget.splitTargets(targets);
    // console.error('targets', t1, t2);

    // calcul mission
    for (let d of game.myDrones) {

        const oldD = lastGame.myDrones.find(v => v.droneId === d.droneId);
        const target = d.idx === 0 ? t1 : t2;

        if (d.emergency) {
            d.mission = 'EMERGENCY';
        } else {
            if ((oldD.mission === 'SCORE' || pointsIfIUpNow > pointsVsIfUpAtEnd) && !d.scored) {
                d.mission = 'SCORE';
            } else {
                if (!target) {
                    d.mission = 'FINISHED';
                } else {
                    if (d.goDownDone) {
                        d.mission = 'SEARCH';
                    } else {
                        d.mission = 'DOWN';
                    }
                }
            }
        }

        console.error('mission', d.mission, 'old', oldD.mission);
    }

    // On recalcule les targets car les missions ont changés
    [t1, t2] = fnTarget.splitTargets(targets);
    console.error('targets', t1, t2);

    // On calcule les angles
    for (let d of game.myDrones) {

        const oldD = lastGame.myDrones.find(v => v.droneId === d.droneId);
        const someoneBottomMe = fnTarget.someoneBottomMe(d)
        let distanceToMove = 600;
        const target = d.idx === 0 ? t1 : t2;
        let debug = [];

        // Compute angle

        if (d.mission === 'DOWN') {
            d.angle = down.getDownAngle(d)
            debug.push('DOWN');
        }

        else if (d.mission === 'SEARCH') {

            debug.push('T=' + target);
            let pointToTarget = fnTarget.creatureIdToPoint(target);
            let angleToTarget = fn.angleTo(d, pointToTarget);

            if (oldD.mission !== d.mission) {
                debug.push('NM');
                d.angle = fn.moduloAngle(angleToTarget);
            } else {
                d.angle = fn.moduloAngle(fn.moveToAngleAtMost(d.angle, angleToTarget, 45));
            }

        }

        else if (d.mission === 'FINISHED') {
            debug.push('FINISHED');
            d.angle = 270;
        }

        else if (d.mission === 'SCORE') {
            debug.push('SCORE' + pointsIfIUpNow + '>' + pointsVsIfUpAtEnd);
            d.angle = 270;
        }

        // FAIRE PEUR

        if (!fnAvoid.jeVaisMeFaireAgresser(d)) {
            const fairePeurA = [...game.creaturesVisibles, ...creaturesInvisible]
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
        }

        // ÉVITER MONSTRES

        const monsters = [...game.creaturesVisibles, ...creaturesInvisible]
            .filter(fn.isMechant)
            .filter(c => fn.getDistance(c, d) < 2500);

        const angleAvoiding = fnAvoid.bestAngleAvoiding(monsters, d, d.angle);
        if (angleAvoiding !== d.angle) {
            debug.push('AVOID');
            d.angle = angleAvoiding;
            distanceToMove = 600;
        }

        // Compute light

        let light = false;

        const probablySomeoneInMyMaxLight = fnLight.probablySomeoneInMyMaxLight(d, game.creatureBboxes)
        const imBottom = d.y > 6500;

        if (someoneBottomMe) {
            debug.push('SB');
        }

        if (
            ((game.turnId - d.lastLightTurn >= 3) || (imBottom && someoneBottomMe))
            && probablySomeoneInMyMaxLight
            && d.y > 2500
        ) {
            light = true;
        }

        // SENDING

        let goTo = fn.forward(d, d.angle, distanceToMove);
        d.x = goTo.x;
        d.y = goTo.y;

        if (light && d.battery >= 5) {
            debug.push('LIGHT');
            d.lastLightTurn = game.turnId;
        }

        console.log('MOVE ' + d.x + ' ' + d.y + ' ' + (light?1:0) + ' ' + debug.join(' '))

    }

    lastGame = JSON.parse(JSON.stringify(game));
}
