import {CreatureVisible, Drone, MyDrone, Point} from "../types";
import {fn} from "./utils";
import {fnFuture} from "./fnFuture";
import {game} from "../main";

export const fnAvoid = {

    jeVaisMeFaireAgresser(d: Drone): boolean {

        const allDrones = [...game.myDrones, ...game.vsDrones];

        return game.creaturesVisibles
            .filter(fn.isMechant)
            .some(m => {

                let nearestDrone = allDrones
                    .filter(d => !d.emergency)
                    .filter(d => {
                        let lightPuissance = d.lightIsOn ? 2000 : 800;
                        return fn.getDistance(d, m) < lightPuissance
                    })
                    .sort((a, b) => fn.getDistance(a, m) - fn.getDistance(b, m))[0];

                if (!nearestDrone) {
                    return false;
                }

                return nearestDrone.droneId === d.droneId;
            });
    },

    bestAngleAvoiding(monsters: CreatureVisible[], d: MyDrone, angleWanted: number, distanceToMove: number): number {

        console.error('best angle avoiding', d.droneId, angleWanted, distanceToMove);

        let DEFAULT_PAS = 100;

        function distanceWithNerestMonster(d: Drone, angle: number) {
            let distance = 100000;
            for (let monster of monsters) {
                let nextMyPosition = fn.forward(d, angle);
                let nextPositionMonster = fnFuture.getFuturePosition(monster);
                distance = Math.min(distance, fn.getDistance(nextPositionMonster, nextMyPosition));
            }
            return distance;
        }

        function jeMeFaisMiam(d, angle, monsters, PAS, distanceToMove) {
            for (let monster of monsters) {
                for (let i = 0; i <= PAS; i++) {
                    let nextMyPosition = fn.forward(d, angle, 600 * Math.min(i/PAS, i/PAS * distanceToMove/600));
                    let nextPositionMonster = fnFuture.getFuturePosition(monster, i/PAS);
                    let distance = fn.getDistance(nextPositionMonster, nextMyPosition);
                    if (distance <= 510) {
                        return true;
                    }
                }
            }
            return false;
        }

        if (!jeMeFaisMiam(d, angleWanted, monsters, DEFAULT_PAS, distanceToMove)) {
            return null;
        }

        let angles: {angle: number, distance: number, distanceBord: number}[] = [];
        for (let angle = 0; angle <= 360; angle += 5) {
            if (!jeMeFaisMiam(d, angle, monsters, DEFAULT_PAS, 600)) {
                angles.push({
                    angle,
                    distance: distanceWithNerestMonster(d, angle),
                    distanceBord: fn.paddingWithBord(fn.forward(d, angle))
                });
            }
        }

        if (angles.length === 0) {
            console.error(d.droneId, "c'est mort");
            return null;
        }

        const paddingPrefered = 500;

        // angles = angles.filter(a => a.distanceBord > paddingPrefered);

        angles = angles.sort((a, b) => {
            if (a.distanceBord >= paddingPrefered && b.distanceBord < paddingPrefered) {
                return -1;
            }
            if (b.distanceBord >= paddingPrefered && a.distanceBord < paddingPrefered) {
                return 1;
            }
            return Math.abs(fn.substrateAngles(a.angle, angleWanted)) - Math.abs(fn.substrateAngles(b.angle, angleWanted));
        });


        const best = angles.find(a => {

            const angle = a.angle;

            const futureD = {
                ...d,
                ...fn.forward(d, angle)
            }

            let futureMonsters = monsters.map(m => ({
                ...m,
                ...fnFuture.getFuturePosition(m),
            }));

            // console.error('futureD', futureD);
            // console.error('futureMonsters', futureMonsters);

            futureMonsters.forEach(m => fnFuture.computeFutureAngle(m, [futureD], []));
            // futureMonsters.forEach(m => console.error('futureFuture m', m.creatureId, fnFuture.getFuturePosition(m), fn.getDistance(futureD, fnFuture.getFuturePosition(m)));

            for (let nextAngle = 0; nextAngle <= 360; nextAngle += 30) {
                if (!jeMeFaisMiam(futureD, nextAngle, futureMonsters, 10, 600)) {
                    // console.error('myFutureFuture', fn.forward(futureD, nextAngle, 600));
                    // console.error('avec ', angle, nextAngle, ' je me fais pas miam next turn');
                    return true;
                }
            }

            console.error('avec ', angle, ' je me fais miam pour sur');
            return false;
        });

        // console.error('best', best);

        return best.angle;
    },

}

