import {Drone, Point} from "../types";
import {fn} from "./utils";

export const down = {

    getTarget(d: Drone): Point {
        if (d.x < 5000) {
            return {
                x: 2000,
                y: 9999,
            }
        } else {
            return {
                x: 8000,
                y: 9999,
            }
        }
    },

    getDownAngle(d: Drone) {
        return fn.angleTo(d, down.getTarget(d));
    }

}
