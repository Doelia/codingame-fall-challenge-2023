import {CreatureVisible, Drone, Game, MyDrone} from "./types";
import {fn} from "./functions/utils";
import {initGame, readInputs} from "./functions/parseInputs";
import {fnPoints} from "./functions/points";
import {fnTarget} from "./functions/targets";
import {fnAvoid} from "./functions/avoid";
import {fnFaireFuir} from "./functions/faireFuir";
import {fnFuture} from "./functions/fnFuture";
import {fnBbox} from "./functions/bbox";
import {fnLight} from "./functions/light";
import {fnVirtualGame} from "./functions/virtualGame";

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

    let output = [];

    // READ INPUTS
    game.turnId++;
    readInputs(game);

    // VIRTUAL GGAME
    fnVirtualGame.beginTurn(game);

    // BBOXES
    lastGame.creatureBboxes = lastGame.creatureBboxes.map(c => fnBbox.enlargeWithMovement(c, game));
    game.creatureBboxes = fnBbox.compute(game, lastGame);

    // FUTURE
    fnVirtualGame.getCreatures()
        .forEach(c => fnFuture.computeFutureAngle(c, [...game.myDrones, ...game.vsDrones], fnVirtualGame.getCreatures()));

    // SCORES
    const [pointsIfIUpNow, pointsVsIfUpAtEnd ] = fnPoints.pointsIfIUpNow(lastGame);
    console.error(pointsIfIUpNow, 'vs', pointsVsIfUpAtEnd);

    const targets = fnTarget.getTargets();

    // Missions accompiles
    for (let d of game.myDrones) {

        const oldD = lastGame.myDrones.find(v => v.droneId === d.droneId);

        if (d.y >= 8500) {
            d.goDownDone = true;
        }

        if (d.emergency) {
            d.goDownDone = true;
        }

        if (oldD.mission === 'SCORE' && d.y <= 500) {
            d.scored = true;
            d.goDownDone = true;
        }

        if (oldD.mission === 'UP') {
            d.goDownDone = true;
        }

        if (oldD.mission === 'UP' && d.y <= 500) {
            d.scored = true;
            d.goDownDone = true;
        }

        d.mission = null;
    }

    let [t1, t2] = fnTarget.splitTargets(targets);

    // calcul mission
    for (let d of game.myDrones) {

        const someoneBottomMe = fnTarget.someoneBottomMe(d)
        const oldD = lastGame.myDrones.find(v => v.droneId === d.droneId);
        const target = d.idx === 0 ? t1 : t2;
        const vsMate = game.vsDrones.find(v => v.imLeft === d.imLeft);

        if (d.emergency) {
            d.mission = 'EMERGENCY';
        } else {
            if ((oldD.mission === 'SCORE' || pointsIfIUpNow > pointsVsIfUpAtEnd) && !d.scored) {
                d.mission = 'SCORE';
            } else if (!d.scored && d.imLeft && fnTarget.oneOneBottomLeftScanned()) {
                d.mission = 'UP';
            }
            else if (!d.scored && !d.imLeft && fnTarget.atLeastOneBottomRightScanned() && targets.length > 0) {
                d.mission = 'SEARCH';
            } else {
                if (targets.length === 0 || (!target && d.creaturesScanned.length > 0)) {
                    d.mission = 'FINISHED';
                } else {
                    if (d.goDownDone || !someoneBottomMe) {
                        d.mission = 'SEARCH';
                    } else {
                        d.mission = 'DOWN';
                    }
                }
            }
        }

        console.error('mission', d.droneId, d.mission, 'old', oldD.mission);
    }

    // On recalcule les targets car les missions ont changés
    [t1, t2] = fnTarget.splitTargets(targets);

    for (let d of game.myDrones) {

        const oldD = lastGame.myDrones.find(v => v.droneId === d.droneId);
        const someoneBottomMe = fnTarget.someoneBottomMe(d)
        let distanceToMove = 600;
        const target = d.idx === 0 ? t1 : t2;
        let debug = [];
        let forceLightFoClose = false;

        const closeInvisbleCreatureToScan = game.creatureBboxes
            .filter(fnBbox.isVeryPrecise)
            .filter(b => !fnTarget.dontScanIt().includes(b.creatureId))
            .filter(b => fn.getDistance(d, fnBbox.getCenter(b)) > 2000)
            .filter(b => fn.angleIsGoingBottom(fn.angleTo(d, fnBbox.getCenter(b))))
            .find(b => fn.getDistance(d, fnBbox.getCenter(b)) < 2000 + 600);

        // Compute angle

        if (d.mission === 'UP') {

            if (closeInvisbleCreatureToScan) {
                let pointToTarget = fnBbox.getCenter(closeInvisbleCreatureToScan);
                let angleToTarget =  fn.moduloAngle(fn.angleTo(d, pointToTarget));
                if (fn.angleIsGoingTop(angleToTarget)) {
                    d.angle = angleToTarget;
                    debug.push('CLOSE='+closeInvisbleCreatureToScan.creatureId);
                    forceLightFoClose = true;
                }
            }

            if (!forceLightFoClose) {
                let target = null; // trop direct seed 1859577925107042800
                if (d.y > 5000) {
                    target = fnTarget.getMostX(d, 1, game);
                } else if (d.y > 2500) {
                    target = fnTarget.getMostX(d, 0, game);
                }

                if (target && (Math.abs(d.x - target.centerPadded.x) < 2000)) {
                    let pointToTarget = target.centerPadded;
                    let angleToTarget =  fn.moduloAngle(fn.angleTo(d, pointToTarget));
                    if (fn.angleIsGoingTop(angleToTarget)) {
                        d.angle = angleToTarget;
                        debug.push('UP=' + target.creatureId);
                    } else {
                        d.angle = 270;
                        debug.push('UP');
                    }
                } else {
                    d.angle = 270;
                    debug.push('UP');
                }
            }


        }

        else if (d.mission === 'DOWN') {

            const mostDown = fnTarget.getMostX(d, 2, game);

            if (closeInvisbleCreatureToScan) {
                let pointToTarget = fnBbox.getCenter(closeInvisbleCreatureToScan);
                let angleToTarget =  fn.moduloAngle(fn.angleTo(d, pointToTarget));
                d.angle = angleToTarget;
                debug.push('CLOSE='+closeInvisbleCreatureToScan.creatureId);
                forceLightFoClose = true;
            }
            else if (mostDown) {
                let pointToTarget = mostDown.center;
                let angleToTarget =  fn.moduloAngle(fn.angleTo(d, pointToTarget));
                d.angle = angleToTarget;
                console.error('down', d.droneId, mostDown, pointToTarget.x, pointToTarget.y, angleToTarget);
                debug.push('DOWN='+mostDown.creatureId); // TODO 186326453458965950
            } else {
                d.angle = 270;
                debug.push('DOWN_270');
            }
        }

        else if (d.mission === 'SEARCH') {

            let target = fnTarget.getTargetsPerTypeThenDistance(d)[0];

            let pointToTarget = fnTarget.creatureIdToPoint(target);
            let angleToTarget =  fn.moduloAngle(fn.angleTo(d, pointToTarget));
            debug.push('T=' + target);
            console.error('search', d.droneId, target, pointToTarget.x, pointToTarget.y, angleToTarget);

            if (oldD.mission !== d.mission || fn.ilestPRetDuBordXY(d)) {
                debug.push('DI');
                d.angle = angleToTarget;
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

        if (!fnAvoid.jeVaisMeFaireAgresser(d) && !forceLightFoClose) {
            const todo = fnVirtualGame.getCreatures()
                .filter(c => c.lastTurnSeen > lastGame.turnId - 3)
                .filter(fn.isGentil)
                .filter(c => !fnFaireFuir.isScannedByVs(c.creatureId))
                .filter(c => !fnFuture.vaDispaitre(c))
                .filter(c => fnFaireFuir.estProcheDeMoi(d, c))
                .filter(c => fn.ilEstPretDuBordX(fnFuture.getFuturePosition(c)))

            for (const s of todo) {
                const pos = fnFaireFuir.getPositionToBouh(s);
                let angle = fn.moduloAngle(fn.angleTo(d, pos));
                if ((d.mission === 'UP' || d.mission === 'SCORE') && !fn.angleIsGoingTop(angle)) {
                    continue;
                }
                console.error(d.mission, angle);
                d.angle = angle;
                distanceToMove = Math.min(600, fn.getDistance(d, pos));
                debug.push('BOU', s.creatureId);
            }
        }


        // ÉVITER MONSTRES

        const monsters = fnVirtualGame.getCreatures()
            .filter(fn.isMechant)
            .filter(c => fn.getDistance(c, d) < 2500);

        const angleAvoiding = fnAvoid.bestAngleAvoiding(monsters, d, d.angle, distanceToMove);
        if (angleAvoiding !== null) {
            debug.push('AVOID');
            d.angle = angleAvoiding;
            distanceToMove = 600;
        }

        // Compute light

        let light = false;

        const probablySomeoneInMyMaxLight = fnLight.probablySomeoneInMyMaxLight(d, game.creatureBboxes)
        const imBottom = d.y > 5500;

        if (someoneBottomMe) {
            debug.push('SB');
        }

        if (
            ((game.turnId - d.lastLightTurn >= 3) || (imBottom && someoneBottomMe) || forceLightFoClose)
            && probablySomeoneInMyMaxLight
            && d.y > 2500
        ) {
            light = true;
        }

        // SENDING

        let goTo = fn.forward(d, d.angle, distanceToMove);

        if (light && d.battery >= 5) {
            debug.push('LIGHT');
            d.lastLightTurn = game.turnId;
        }

        if (goTo.y < 500) {
            goTo.y = 500;
        }

        output.push('MOVE ' + goTo.x + ' ' + goTo.y + ' ' + (light?1:0) + ' ' + debug.join(' '))

    }

    lastGame = JSON.parse(JSON.stringify(game));
    fnVirtualGame.endTurn(lastGame);

    console.error('monsters', fnVirtualGame.getCreatures().filter(fn.isMechant).map(m => ({id: m.creatureId, x: m.x, y: m.y, vx: m.vx, vy: m.vy})));

    // console.error('copains', fnVirtualGame.getCreatures()
    //     .filter(c => c.lastTurnSeen > lastGame.turnId - 3)
    //     .filter(fn.isGentil)
    //     .map(m => ({id: m.creatureId, x: m.x, y: m.y, lastTurnSeen: m.lastTurnSeen})));

    output.forEach(o => console.log(o));


}
