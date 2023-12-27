import {CreatureVisible, MyDrone} from "../types";
import {fn} from "./utils";
import {game} from "../main";
import {future} from "./future";


// TODO debug 1709671787535293000
// TODO debug 7566632910746621000

export const fnAvoid = {


    bestAngleAvoiding(monsters: CreatureVisible[], d: MyDrone, angleWanted: number) {

        function isGoodAngle(angle: number) {
            return getDangerours(d, angle).length <= 0;
        }

        // ILs sont dangereux s'ils sont capables de me manger au prochain tour
        function getDangerours(d, angle) {
            let PAS = 100;
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

        return angleWanted;
    },

}

