import {CreatureVisible, Drone, MyDrone} from "../types";
import {fn} from "./utils";
import {fnFuture} from "./fnFuture";
import {game} from "../main";

export const fnAvoid = {

    jeVaisMeFaireAgresser(d: Drone) {

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

    bestAngleAvoiding(monsters: CreatureVisible[], d: MyDrone, angleWanted: number): number {

        function distanceWithNerestMonster(d, angle) {
            let distance = 100000;
            for (let monster of monsters) {
                let nextMyPosition = fn.forward(d, angle);
                let nextPositionMonster = fnFuture.getFuturePosition(monster)
                distance = Math.min(distance, fn.getDistance(nextPositionMonster, nextMyPosition));
            }
            return distance;
        }

        function jeMeFaisMiam(d, angle, monsters, PAS=100, debug=false) {
            for (let monster of monsters) {
                for (let i = 0; i <= PAS; i++) {
                    let nextMyPosition = fn.forward(d, angle, i/PAS * 600);
                    let nextPositionMonster = fnFuture.getFuturePosition(monster, i/PAS)
                    let distance = fn.getDistance(nextPositionMonster, nextMyPosition);
                    if (distance <= 510) {
                        return true;
                    } else {
                        if (debug) {
                            // console.error('no miam', monster.creatureId, distance, nextPositionMonster, nextMyPosition);
                        }
                    }
                }
            }
            return false;
        }

        let distancePrefered = 0;

        if (!jeMeFaisMiam(d, angleWanted, monsters) && distanceWithNerestMonster(d, angleWanted) >= 1000) {
            return angleWanted;
        }

        let angles: {angle: number, distance: number}[] = [];
        for (let angle = 0; angle <= 360; angle += 5) {
            if (!jeMeFaisMiam(d, angle, monsters)) {
                angles.push({
                    angle,
                    distance: distanceWithNerestMonster(d, angle),
                });
            }
        }

        angles = angles.sort((a, b) => {
            if (a.distance > distancePrefered && b.distance < distancePrefered) {
                return -1;
            }
            if (a.distance < distancePrefered && b.distance > distancePrefered) {
                return 1;
            }
            return Math.abs(fn.substrateAngles(a.angle, angleWanted)) - Math.abs(fn.substrateAngles(b.angle, angleWanted));
        });


        if (angles.length === 0) {
            console.error("c'est mort");
            return angleWanted;
        }

        const best = angles.find(a => {

            const angle = a.angle;

            let futureD = fn.forward(d, angle);
            let futureMonsters = monsters.map(m => ({
                ...m,
                ...fnFuture.getFuturePosition(m),
            }));

            const futureGame = {...game};
            futureGame.myDrones.find(v => v.droneId === d.droneId).x = futureD.x;
            futureGame.myDrones.find(v => v.droneId === d.droneId).y = futureD.y;

            console.error('futureD', futureD);
            console.error('futureMonsters', futureMonsters);

            futureMonsters.forEach(m => fnFuture.computeNextPosition(m, futureGame, []));
            // futureMonsters.forEach(m => console.error('futureFuture m', m.creatureId, fnFuture.getFuturePosition(m), fn.getDistance(futureD, fnFuture.getFuturePosition(m)));

            for (let nextAngle = 0; nextAngle <= 360; nextAngle += 90) {
                if (!jeMeFaisMiam(futureD, nextAngle, futureMonsters, 10, true)) {
                    // console.error('myFutureFuture', fn.forward(futureD, nextAngle, 600));
                    console.error('avec ', nextAngle, ' je me fais pas miam next turn');
                    return true;
                }
            }

            console.error('avec ', angle, ' je me fais miam pour sur');
            return false;
        });

        return best.angle;
    },

}

