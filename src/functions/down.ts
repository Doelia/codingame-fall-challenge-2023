import {Drone, Game, MyDrone, Point} from "../types";
import {fn} from "./utils";
import {fnBbox} from "./bbox";

export const down = {

    getTarget(d: Drone): Point {
        let p = {...d};
        if (d.x < 5000) {
            p.x = 2000;
        } else {
            p.x = 8000;
        }
        if (d.y < 5000) {
            p.y = 5000;
        } else {
            p.y = 9999;
        }
        return p;
    },

    getTarget2(d: MyDrone, game: Game): {creatureId: number, center: Point, centerPadded: Point} {
        const creaturesLeftToRight = game.creatureBboxes
            .filter(v => game.creaturesMetas.get(v.creatureId).type === 2)
            .sort((a, b) => fnBbox.getCenter(a).x - fnBbox.getCenter(b).x);

        let bbox = d.imLeft ? creaturesLeftToRight[0] : creaturesLeftToRight[creaturesLeftToRight.length - 1];

        const center = fnBbox.getCenter(bbox);

        return {
            creatureId: bbox.creatureId,
            center,
            centerPadded: fn.eloignerDuBord(center, 2000),
        };
    },

    getDownAngle(d: Drone) {
        return fn.angleTo(d, down.getTarget(d));
    }

}
