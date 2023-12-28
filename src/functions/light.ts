import {fnBbox} from "./bbox";
import {Bbox, CreatureBbox, Drone} from "../types";
import {game} from "../main";
import {fn} from "./utils";

export const fnLight = {

    probablySomeoneInMyMaxLight(d: Drone, bboxes: CreatureBbox[], myScansIds: number[]) {

        const dontScanIt = [
            ...myScansIds,
            ...game.creaturesValidated.map(fn.id),
        ];

        bboxes = bboxes.filter(c => !dontScanIt.includes(c.creatureId));

        const myBbox = fnLight.lightDroneToBbox(d);
        for (const bbox of bboxes) {
            if (fnBbox.intersects(myBbox, bbox)) {
                return true;
            }
        }
        return false;
    },

    lightDroneToBbox(d: Drone): Bbox {
        let light = 2000;
        return {
            xMin: d.x - light/2,
            xMax: d.x + light/2,
            yMin: d.y - light/2,
            yMax: d.y + light/2,
        }
    },
}
