import {CreatureBbox, CreatureMeta, Drone, Game, Point, Radar} from "../types";
import {fn} from "./utils";

export const fnBbox = {

    compute(game: Game): CreatureBbox[] {

        const bboxes = [];

        const idCreaturesOnMap = game.radars.map(fn.id).filter(fn.uniq);

        const creatures = game.creaturesMetasArr
            .filter(fn.isGentil)
            .filter(c => idCreaturesOnMap.includes(c.creatureId));

        for (const meta of creatures) {
            let bbox = fnBbox.getBboxMeta(meta);
            for (let r of game.radars.filter(r => r.creatureId === meta.creatureId)) {
                const d = game.myDrones.find(d => d.droneId === r.droneId);
                bbox = fnBbox.intersectBbox(bbox, fnBbox.getBboxRadar(d, r));
            }
            bboxes.push(bbox);
        }

        return bboxes;

    },

    enlargeWithMovement(bbox: CreatureBbox): CreatureBbox {
        let speed = 400;
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

    intersectBbox(a: CreatureBbox, b: CreatureBbox): CreatureBbox {
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
