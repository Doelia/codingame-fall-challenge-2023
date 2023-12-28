import {fnBbox} from "./bbox";
import {CreatureBbox, Drone} from "../types";
import {game} from "../main";
import {fn} from "./utils";

export const fnLight = {

    probablySomeoneInMyMaxLight(d: Drone, bboxes: CreatureBbox[], myScansIds: number[]) {

        const dontScanIt = [
            ...myScansIds,
            ...game.creaturesValidated.map(fn.id),
        ];

        bboxes = bboxes.filter(c => !dontScanIt.includes(c.creatureId));

        const myBbox = fnBbox.lightDroneToBbox(d);
        for (const bbox of bboxes) {
            if (fnBbox.intersects(myBbox, bbox)) {
                return true;
            }
        }
        return false;
    }
}
