import {CreatureVisible, Drone, Game, Point} from "../types";
import {fn} from "./utils";

export const fnFuture = {

    computeFutureAngle(c: CreatureVisible, allDrones: Drone[], creatures: CreatureVisible[]) {

        if (fn.isMechant(c)) {

            let nearestDrone = allDrones
                .filter(d => !d.emergency)
                .filter(d => {
                    let lightPuissance = d.lightIsOn ? 2000 : 800;
                    return fn.getDistance(d, c) < lightPuissance;
                }) // Il me voit
                .sort((a, b) => fn.getDistance(a, c) - fn.getDistance(b, c))[0];

            let nearestMonster = creatures
                .filter(fn.isMechant)
                .filter(v => c.creatureId !== v.creatureId)
                .filter(v => fn.getDistance(v, c) <= 600)
                .filter(v => !fn.samePoint(v, c))
                .sort((a, b) => fn.getDistance(a, c) - fn.getDistance(b, c))[0];

            if (nearestDrone) {
                // console.error(c.creatureId, c.x, c.y, 'attaque', nearestDrone.droneId, nearestDrone.x, nearestDrone.y, nearestDrone.lightIsOn);
                c.nextAngle = fn.moduloAngle(fn.angleTo(c, nearestDrone));
                c.nextDistance = Math.min(540, fn.getDistance(c, nearestDrone))
            } else if (nearestMonster) {
                // console.error(c.creatureId, c.x, c.y, 'fuit', nearestMonster.creatureId, nearestMonster.x, nearestMonster.y);
                c.nextAngle = fn.moduloAngle(fn.angleTo(nearestMonster, c));
                c.nextDistance = 200;
            } else {
                let nextPosition = { x: c.x + c.vx, y: c.y + c.vy, }

                if (nextPosition.y < 2500) {
                    nextPosition.y = c.y - c.vy;
                }
                if (nextPosition.x > 9999 || nextPosition.x < 0) {
                    nextPosition.x = c.x - c.vx;
                }

                c.nextAngle = fn.moduloAngle(fn.angleTo(c, nextPosition));
                c.nextDistance = Math.min(270, fn.getDistance(c, nextPosition));
            }
        } else {

            let nearestDrone = allDrones
                .filter(d => !d.emergency)
                .filter(d => fn.getDistance(d, c) <= 1400) // il m'entends
                .sort((a, b) => fn.getDistance(a, c) - fn.getDistance(b, c))[0];

            if (nearestDrone) {
                c.nextAngle = fn.moduloAngle(fn.angleTo(nearestDrone, c));
                c.nextDistance = 400;
            } else {
                const nextPosition = { x: c.x + c.vx, y: c.y + c.vy, }
                c.nextAngle = fn.moduloAngle(fn.angleTo(c, nextPosition));
                c.nextDistance = 200;
            }
        }

    },

    vaDispaitre(c: CreatureVisible) {
        const futurePosition = fnFuture.getFuturePosition(c);
        return c.type !== -1 && (futurePosition.x === 0 || futurePosition.x === 9999);
    },

    getFuturePosition(c: CreatureVisible, projection=1) {
        const futurePosition =  fn.forward(c, c.nextAngle, projection*c.nextDistance);
        if (fn.isMechant(c) && futurePosition.y < 2500 && projection === 1) {
            futurePosition.y = 2500;
        }
        return futurePosition;
    },

    applyNextPosition(c: CreatureVisible) {
        if (c.nextDistance && c.nextAngle) {
            const nextPosition = fnFuture.getFuturePosition(c);
            c.vx = nextPosition.x - c.x;
            c.vy = nextPosition.y - c.y;
            c.x = nextPosition.x;
            c.y = nextPosition.y;
        }
        return c;
    },


}
