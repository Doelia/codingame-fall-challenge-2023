import {game} from "../main";
import {fn} from "./utils";
import {CreatureVisible, Drone, Point} from "../types";
import {fnFuture} from "./fnFuture";

export const fnFaireFuir = {


    estProcheDeMoi(d: Drone, creature: CreatureVisible) {
        return fn.getDistance(d, creature) < 2000;
    },

    isScannedByVs(creatureId: number) {
        if (game.vsCreaturesValidates.map(fn.id).includes(creatureId)) {
            return true;
        }
        if (game.vsDrones.some(d => d.creaturesScanned.includes(creatureId))) {
            return true;
        }
        return false;
    },

    ilEstPretDuBord(p: Point) {
        const padding = 1000;
        return p.x < padding || p.x > 10000-padding;
    },

    getPositionToBouh(c: CreatureVisible): Point {
        const nextPosition = fnFuture.getFuturePosition(c);
        const space = 300;
        if (nextPosition.x < 5000) {
            return {x: nextPosition.x + space, y: nextPosition.y};
        } else {
            return {x: nextPosition.x - space, y: nextPosition.y};
        }
    },


}
