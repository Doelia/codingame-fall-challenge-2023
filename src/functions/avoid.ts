import {CreatureVisible, Drone, MyDrone} from "../types";
import {fn} from "./utils";
import {future} from "./future";
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
                        let lightPuissance = d.lastLightTurn === game.turnId - 1 ? 2000 : 800;
                        return fn.getDistance(d, m) < lightPuissance
                    })
                    .sort((a, b) => fn.getDistance(a, m) - fn.getDistance(b, m))[0];

                return nearestDrone.droneId === d.droneId;
            });
    },

    bestAngleAvoiding(monsters: CreatureVisible[], d: MyDrone, angleWanted: number): number {

        let PAS = 100;

        function distanceWithNerestMonster(d, angle) {
            let distance = 100000;
            for (let monster of monsters) {
                let nextMyPosition = fn.forward(d, angle);
                let nextPositionMonster = future.getFuturePosition(monster)
                distance = Math.min(distance, fn.getDistance(nextPositionMonster, nextMyPosition));
            }
            return distance;
        }

        function jeMeFaisMiam(d, angle) {
            for (let monster of monsters) {
                for (let i = 0; i <= PAS; i++) {
                    let nextMyPosition = fn.forward(d, angle, i/PAS * 600);
                    let nextPositionMonster = future.getFuturePosition(monster, i/PAS)
                    let distance = fn.getDistance(nextPositionMonster, nextMyPosition);
                    if (distance <= 510) {
                        return true;
                    }
                }
            }
            return false;
        }

        let distancePrefered = 0;

        if (!jeMeFaisMiam(d, angleWanted) && distanceWithNerestMonster(d, angleWanted) >= 1000) {
            return angleWanted;
        }

        let angles = [];
        for (let angle = 0; angle <= 360; angle += 5) {
            if (!jeMeFaisMiam(d, angle)) {
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

        const best = angles[0];
        console.error('wanted', angleWanted, 'best', best);

        return best.angle;
    },

}

