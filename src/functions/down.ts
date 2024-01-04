import {Drone, Point} from "../types";
import {fn} from "./utils";

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

    getDownAngle(d: Drone) {
        return fn.angleTo(d, down.getTarget(d));
    }

}
