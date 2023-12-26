import {CreatureVisible, MyDrone} from "../types";
import {fn} from "./utils";
import {game} from "../main";

export const fnAvoid = {

    getFutureMonsterPosition(monster: CreatureVisible, projection=1) {
        return fn.forward(monster, monster.nextAngle, projection*monster.nextDistance);
    },

    bestAngleAvoiding(d: MyDrone, angleWanted: number) {

        const monsters = game.creaturesVisibles
            .filter(c => c.type === -1)
            .filter(c => fn.getDistance(c, d) < 2000)
            .sort((a, b) => fn.getDistance(a, d) - fn.getDistance(b, d))

        function isGoodAngle(angle: number) {
            return getDangerours(monsters, d, angle).length <= 0;
        }

        // ILs sont dangereux s'ils sont capables de me manger au prochain tour
        function getDangerours(monsters, d, angle) {
            let PAS = 100;
            return monsters.filter(monster => {
                for (let i = 0; i <= PAS; i++) {
                    let nextMyPosition = fn.forward(d, angle, i/PAS * 600);
                    let nextPositionMonster = fnAvoid.getFutureMonsterPosition(monster, i/PAS)
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

