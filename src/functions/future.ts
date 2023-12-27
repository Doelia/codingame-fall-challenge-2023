import {CreatureVisible, Game} from "../types";
import {fn} from "./utils";

export const future = {


    computeNextPosition(c: CreatureVisible, game: Game) {

        if (c.type === -1) {
            const allDrones = [...game.myDrones, ...game.vsDrones];

            let nearestDrone = allDrones
                .filter(d => !d.emergency)
                .filter(d => {
                    let lightPuissance = d.lastLightTurn === game.turnId - 1 ? 2000 : 800;
                    return fn.getDistance(d, c) < lightPuissance
                })
                .sort((a, b) => fn.getDistance(a, c) - fn.getDistance(b, c))[0];

            if (!nearestDrone) {
                c.nextAngle = fn.moduloAngle(fn.angleTo(c, { x: c.x + c.vx, y: c.y + c.vy }));
                c.nextDistance = 270;
            } else {
                c.nextAngle =  fn.moduloAngle(fn.angleTo(c, nearestDrone));
                c.nextDistance = 540;
            }
        }
    },

    getFuturePosition(c: CreatureVisible, projection=1) {
        return fn.forward(c, c.nextAngle, projection*c.nextDistance);
    },

    applyNextPosition(c: CreatureVisible) {
        if (c.nextDistance && c.nextAngle) {
            const nextPosition = future.getFuturePosition(c);
            c.x = nextPosition.x;
            c.y = nextPosition.y;
        }
        return c;
    }

}
