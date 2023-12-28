import { fn } from "./utils";
import { future } from "./future";
// TODO debug 416989328197959550 // Voir dans le future
// TODO debug 3691718579144519700 vs kami
export const fnAvoid = {
    bestAngleAvoiding(monsters, d, angleWanted) {
        let PAS = 100;
        function distanceWithNerestMonster(d, angle) {
            let distance = 100000;
            for (let monster of monsters) {
                let nextMyPosition = fn.forward(d, angle);
                let nextPositionMonster = future.getFuturePosition(monster);
                distance = Math.min(distance, fn.getDistance(nextPositionMonster, nextMyPosition));
            }
            return distance;
        }
        function jeMeFaisMiam(d, angle) {
            for (let monster of monsters) {
                for (let i = 0; i <= PAS; i++) {
                    let nextMyPosition = fn.forward(d, angle, i / PAS * 600);
                    let nextPositionMonster = future.getFuturePosition(monster, i / PAS);
                    let distance = fn.getDistance(nextPositionMonster, nextMyPosition);
                    if (distance <= 510) {
                        return true;
                    }
                }
            }
            return false;
        }
        let goodAngles = [];
        // build array from 0 to 360
        let angles = [];
        for (let i = 0; i <= 360; i++) {
            if (!jeMeFaisMiam(d, i)) {
                angles.push(i);
            }
        }
        // angles.sort((a, b) => {
        //     const diff = angleWanted - a;
        //
        // });
        console.error("c'est mort");
        return angles[0];
    },
};
