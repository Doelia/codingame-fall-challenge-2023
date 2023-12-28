import { fn } from "./utils";
export const future = {
    computeNextPosition(c, game) {
        const allDrones = [...game.myDrones, ...game.vsDrones];
        if (c.type === -1) {
            let nearestDrone = allDrones
                .filter(d => !d.emergency)
                .filter(d => {
                let lightPuissance = d.lastLightTurn === game.turnId - 1 ? 2000 : 800;
                return fn.getDistance(d, c) < lightPuissance;
            })
                .sort((a, b) => fn.getDistance(a, c) - fn.getDistance(b, c))[0];
            if (!nearestDrone) {
                c.nextAngle = fn.moduloAngle(fn.angleTo(c, { x: c.x + c.vx, y: c.y + c.vy }));
                if (c.vx === 0 && c.vy === 0) {
                    c.nextDistance = 0;
                }
                else {
                    c.nextDistance = 270;
                }
            }
            else {
                c.nextAngle = fn.moduloAngle(fn.angleTo(c, nearestDrone));
                c.nextDistance = 540;
            }
        }
        else {
            let nearestDrone = allDrones
                .filter(d => !d.emergency)
                .filter(d => fn.getDistance(d, c) <= 1400) // il m'entends
                .sort((a, b) => fn.getDistance(a, c) - fn.getDistance(b, c))[0];
            if (nearestDrone) {
                c.nextAngle = fn.moduloAngle(fn.angleTo(nearestDrone, c));
                c.nextDistance = 400;
            }
            else {
                const nextPosition = { x: c.x + c.vx, y: c.y + c.vy, };
                c.nextAngle = fn.moduloAngle(fn.angleTo(c, nextPosition));
                c.nextDistance = 200;
            }
        }
    },
    vaDispaitre(c) {
        const futurePosition = future.getFuturePosition(c);
        return c.type !== -1 && (futurePosition.x === 0 || futurePosition.x === 9999);
    },
    getFuturePosition(c, projection = 1) {
        return fn.forward(c, c.nextAngle, projection * c.nextDistance);
    },
    applyNextPosition(c) {
        if (c.nextDistance && c.nextAngle) {
            const nextPosition = future.getFuturePosition(c);
            c.x = nextPosition.x;
            c.y = nextPosition.y;
        }
        return c;
    }
};
