import {Bbox, CreatureBbox, CreatureMeta, Drone, Game, Point, Radar} from "../types";
import {fn} from "./utils";
import {game} from "../main";

export const fnBbox = {

    compute(game: Game, lastGame: Game): CreatureBbox[] {

        let bboxes = [];

        const idCreaturesOnMap = game.radars.map(fn.id).filter(fn.uniq);

        const creatures = game.creaturesMetasArr
            .filter(fn.isGentil)
            .filter(c => idCreaturesOnMap.includes(c.creatureId));

        for (const meta of creatures) {
            let bbox = fnBbox.getBboxMeta(meta);
            for (let r of game.radars.filter(r => r.creatureId === meta.creatureId)) {
                const d = game.myDrones.find(d => d.droneId === r.droneId);
                bbox = fnBbox.getIntersection(bbox, fnBbox.getBboxRadar(d, r));
            }
            bboxes.push(bbox);
        }

        bboxes = bboxes.map(bbox => {
            let oldBbox = lastGame.creatureBboxes.find(b => b.creatureId === bbox.creatureId);
            if (oldBbox) {
                return fnBbox.getIntersection(bbox, oldBbox);
            } else {
                return bbox;
            }
        });

        return bboxes;

    },

    // return true if the two bboxes intersect
    intersects(a: Bbox, b: Bbox): boolean {
        return (
            a.xMin <= b.xMax &&
            a.xMax >= b.xMin &&
            a.yMin <= b.yMax &&
            a.yMax >= b.yMin
        );
    },

    getMotorBbox(d: Drone): Bbox {
        return {
            xMin: d.x - 1400,
            xMax: d.x + 1400,
            yMin: d.y - 1400,
            yMax: d.y + 1400,
        }
    },


    enlargeWithMovement(bbox: CreatureBbox, game: Game): CreatureBbox {

        const jentendsUnMoteur = [...game.vsDrones, ...game.myDrones].some(d => {
            return fnBbox.intersects(bbox, fnBbox.getMotorBbox(d));
        });

        let speed = jentendsUnMoteur ? 400 : 200;

        return {
            creatureId: bbox.creatureId,
            xMin: bbox.xMin - speed,
            xMax: bbox.xMax + speed,
            yMin: bbox.yMin - speed,
            yMax: bbox.yMax + speed,
        }
    },

    getCenter(bbox: CreatureBbox): Point {
        return {
            x: (bbox.xMin + bbox.xMax) / 2,
            y: (bbox.yMin + bbox.yMax) / 2,
        }
    },

    fishTypeToMinMaxY: (fishType: number) => {
        if (fishType === 0) return [2500, 5000];
        if (fishType === 1) return [5000, 7500];
        if (fishType === 2) return [7500, 10000];
    },

    getIntersection(a: CreatureBbox, b: CreatureBbox): CreatureBbox {
        return {
            creatureId: a.creatureId,
            xMin: Math.max(a.xMin, b.xMin),
            xMax: Math.min(a.xMax, b.xMax),
            yMin: Math.max(a.yMin, b.yMin),
            yMax: Math.min(a.yMax, b.yMax),
        }
    },

    getBboxMeta(c: CreatureMeta): CreatureBbox {

        const [yMin, yMax] = fnBbox.fishTypeToMinMaxY(c.type);

        return {
            creatureId: c.creatureId,
            xMin: 0,
            xMax: 9999,
            yMin,
            yMax,
        }
    },

    getBboxRadar(d: Drone, r: Radar): CreatureBbox {

        switch (r.direction) {
            case 'TL': return {
                creatureId: r.creatureId, xMin: 0, yMin: 0, xMax: d.x, yMax: d.y,
            };
            case 'TR': return {
                creatureId: r.creatureId, xMin: d.x, yMin: 0, xMax: 9999, yMax: d.y,
            };
            case 'BR': return {
                creatureId: r.creatureId, xMin: d.x, yMin: d.y, xMax: 9999, yMax: 9999,
            };
            case 'BL': return {
                creatureId: r.creatureId, xMin: 0, yMin: d.y, xMax: d.x, yMax: 9999,
            };
        }

    }

}
