import {game} from "../main";
import {fn} from "./utils";
import {CreatureVisible, Drone, Point} from "../types";

export const fnFaireFuir = {

    ilMentend(d: Drone, c: CreatureVisible) {
        return fn.getDistance(d, c) < 1400;
    },

    estProcheDeMoi(d: Drone, creature: CreatureVisible) {
        return fn.getDistance(d, creature) < 2000;
    },

    getFuturePosition(c: CreatureVisible): Point {
        for (let d of game.myDrones) {
            if (this.ilMentend(d, c)) {
                const angle = fn.angleTo(d, c);
                const distance = 400;
                return fn.forward(c, angle, distance);
            } else {
                return {
                    x: c.x + c.vx,
                    y: c.y + c.vy,
                }
            }
        }
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
        const padding = 2000;
        return p.x < padding || p.x > 10000-padding;
    },

    getPositionToBouh(creature: CreatureVisible): Point {
        const space = 300;
        if (creature.x < 5000) {
            return {x: creature.x + space, y: creature.y};
        } else {
            return {x: creature.x - space, y: creature.y};
        }
    },


}
