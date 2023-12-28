import { game } from "../main";
import { fn } from "./utils";
import { future } from "./future";
export const fnFaireFuir = {
    estProcheDeMoi(d, creature) {
        return fn.getDistance(d, creature) < 2000;
    },
    isScannedByVs(creatureId) {
        if (game.vsCreaturesValidates.map(fn.id).includes(creatureId)) {
            return true;
        }
        if (game.vsDrones.some(d => d.creaturesScanned.includes(creatureId))) {
            return true;
        }
        return false;
    },
    ilEstPretDuBord(p) {
        const padding = 1000;
        return p.x < padding || p.x > 10000 - padding;
    },
    getPositionToBouh(c) {
        const nextPosition = future.getFuturePosition(c);
        const space = 300;
        if (nextPosition.x < 5000) {
            return { x: nextPosition.x + space, y: nextPosition.y };
        }
        else {
            return { x: nextPosition.x - space, y: nextPosition.y };
        }
    },
};
