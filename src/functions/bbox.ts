import {Bbox, CreatureBbox, CreatureMeta, CreatureVisible, Drone, Game, Point, Radar} from "../types";
import {fn} from "./utils";
import {game} from "../main";

export const fnBbox = {

    compute(game: Game, lastGame: Game): CreatureBbox[] {

        let bboxes: CreatureBbox[] = [];

        const idCreaturesOnMap = game.radars.map(fn.id).filter(fn.uniq);
        const creatures = game.creaturesMetasArr
            .filter(fn.isGentil)
            .filter(c => idCreaturesOnMap.includes(c.creatureId));

        for (const meta of creatures) {


            // On prend la vielle bbox
            let oldBbox = lastGame.creatureBboxes.find(b => b.creatureId === meta.creatureId);

            // S'il y en a pas, c'est que c'est le premier tour de jeu, on cacule
            if (!oldBbox) oldBbox = fnBbox.getBboxInit(meta);

            let bbox = oldBbox;

            // On intersecte avec la bbox de vie
            bbox = fnBbox.getIntersection(bbox, fnBbox.getBboxMeta(meta));

            // On intersecte avec les bboxes des radars
            for (let r of game.radars.filter(r => r.creatureId === meta.creatureId)) {
                const d = game.myDrones.find(d => d.droneId === r.droneId);
                let radarBbox = fnBbox.getBboxRadar(d, r);
                bbox = fnBbox.getIntersection(bbox, radarBbox);
            }

            // Si on le voit, on croise directement avec sa bbox précise
            let visibleFish = game.creaturesVisibles.find(c => c.creatureId === meta.creatureId)
            if (visibleFish) {
                bbox = fnBbox.getIntersection(bbox, fnBbox.visibleFishesToBboxes(visibleFish));
            }

            bboxes.push(bbox);


        }

        // bbox miroires

        bboxes = bboxes.map(b => {
            if (game.turnId <= fnBbox.turnToTakeEnigneEffect(game.creaturesMetas.get(b.creatureId))) {
                const bboxMirorFish = bboxes.find(b2 => b2.creatureId === fnBbox.getCreatureIdMiroir(b.creatureId));
                const bboxMirored = fnBbox.applyMiror(bboxMirorFish);
                return fnBbox.getIntersection(b, bboxMirored);
            } else {
                console.error('dont apply mirror on', b.creatureId);
                return b;
            }
        });

        return bboxes;

    },

    turnToTakeEnigneEffect(c: CreatureMeta): number {
        if (c.type === 0) return 6;
        if (c.type === 1) return 9;
        if (c.type === 2) return 13;
    },

    visibleFishesToBboxes(c: CreatureVisible): CreatureBbox {
        return {
            creatureId: c.creatureId,
            xMin: c.x,
            xMax: c.x,
            yMin: c.y,
            yMax: c.y,
        };
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

    applyMiror(bbox: CreatureBbox): CreatureBbox {
        return {
            creatureId: fnBbox.getCreatureIdMiroir(bbox.creatureId),
            xMin: 9999 - bbox.xMax,
            xMax: 9999 - bbox.xMin,
            yMin: bbox.yMin,
            yMax: bbox.yMax,
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

    getCreatureIdMiroir(id: number): number {
        switch (id) {
            case 10: return 11;
            case 11: return 10;
            case 12: return 13;
            case 13: return 12;
            case 14: return 15;
            case 15: return 14;
            case 4: return 5;
            case 5: return 4;
            case 6: return 7;
            case 7: return 6;
            case 8: return 9;
            case 9: return 8;
        }
    },

    getBboxInit(c: CreatureMeta): CreatureBbox {
        const [yMin, yMax] = fnBbox.fishTypeToMinMaxY(c.type);

        return {
            creatureId: c.creatureId,
            xMin: 1000,
            xMax: 9000,
            yMin: yMin + 500,
            yMax : yMax - 1000,
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
