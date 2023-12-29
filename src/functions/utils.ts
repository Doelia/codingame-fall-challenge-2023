import {game} from "../main";
import {CreatureMeta, CreatureVisible, Drone, Point} from "../types";

export const fn = {
    getDistance: (p1: Point, p2: Point): number => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)),
    samePoint: (p1: Point, p2: Point): boolean => p1.x === p2.x && p1.y === p2.y,
    reversePoint: function(p: Point): Point { return { x: -p.x, y: -p.y, } },
    toRadians: (degrees: number): number => degrees * Math.PI / 180,
    toDegrees: (radians: number): number  => radians * 180 / Math.PI,
    cos: (degrees: number): number => Math.cos(fn.toRadians(degrees)),
    sin: (degrees: number): number =>  Math.sin(fn.toRadians(degrees)),
    turnAtMost(angle: number, turn: number, max: number =360): number {
        return Math.abs(turn) > max ? angle + (turn > 0 ? max : -max) : angle + turn;
    },
    moveToAngleAtMost(angle: number, angleTarget: number, max=360): number {
        let sub = fn.substrateAngles(angleTarget, angle);
        return fn.turnAtMost(angle, sub, max);
    },
    angleTo: (from: Point, to: Point): number => fn.toDegrees(Math.atan2(to.y - from.y, to.x - from.x)),
    forward: (p: Point, angle: number, dist= 600): Point => ({
        x: Math.max(0, Math.min(9999, Math.round(p.x + fn.cos(angle) * dist))),
        y: Math.max(0, Math.min(9999, Math.round(p.y + fn.sin(angle) * dist))),
    }),
    wiggle: (angle: number, maxAngle: number): number => fn.moduloAngle(angle + (Math.random() * maxAngle) - (Math.random() * maxAngle)),
    moduloAngle: (angle: number): number => (angle % 360) > 0 ? (angle % 360) : (angle % 360) + 360,
    substrateAngles(h1: number, h2: number) {
        if (h1 < 0 || h1 >= 360) {
            h1 = (h1 % 360 + 360) % 360;
        }
        if (h2 < 0 || h2 >= 360) {
            h2 = (h2 % 360 + 360) % 360;
        }
        const diff = h1 - h2;
        if (diff > -180 && diff <= 180) {
            return diff;
        } else if (diff > 0) {
            return diff - 360;
        } else {
            return diff + 360;
        }
    },
    id: (p): number => p.creatureId,
    uniq: ((v, i, a) => a.indexOf(v) === i),
    turnToUp: (d: Drone): number => Math.floor((d.y-500) / 600),
    isInGame: ({x, y}: Point): boolean => x >= 0 && x <= 9999 && y >= 0 && y <= 9999,
    isGentil: (c: CreatureMeta): boolean => c.type !== -1,
    isMechant: (c: CreatureMeta): boolean => c.type === -1,
    concat: (acc, v) => [...acc, ...v],
}
