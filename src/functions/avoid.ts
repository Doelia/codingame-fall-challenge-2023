import {CreatureVisible, MyDrone} from "../types";
import {fn} from "./utils";
import {future} from "./future";

export const fnAvoid = {


    bestAngleAvoiding(monsters: CreatureVisible[], d: MyDrone, angleWanted: number) {

        let PAS = 100;

        function isGoodAngle(angle: number) {
            return getDangerours(d, angle).length <= 0;
        }

        function distanceWithNerestMonster(d, angle) {
            let distance = 100000;
            for (let monster of monsters) {
                let nextMyPosition = fn.forward(d, angle);
                let nextPositionMonster = future.getFuturePosition(monster)
                distance = Math.min(distance, fn.getDistance(nextPositionMonster, nextMyPosition));
            }
            return distance;
        }

        // ILs sont dangereux s'ils sont capables de me manger au prochain tour
        function getDangerours(d, angle) {
            return monsters.filter(monster => {
                for (let i = 0; i <= PAS; i++) {
                    let nextMyPosition = fn.forward(d, angle, i/PAS * 600);
                    let nextPositionMonster = future.getFuturePosition(monster, i/PAS)
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

        console.error("c'est mort");

        return angleWanted;
    },

}

