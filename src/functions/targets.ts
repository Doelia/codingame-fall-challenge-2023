import {fn} from "./utils";
import {game} from "../main";
import {fnBbox} from "./bbox";
import {CreatureBbox, Drone, MyDrone, Point, Radar} from "../types";

export const fnTarget = {

    splitTargets(targets: number[]): number[] {

        const drone1 = game.myDrones[0];
        const drone2 = game.myDrones[1];

        if (targets.length === 0) {
            return [null, null];
        }

        // console.error(targets.map(r => ({
        //     id: r, ...fnTarget.creatureIdToPoint(r),
        //     distance1: fn.getDistance(drone1, fnTarget.creatureIdToPoint(r)),
        //     distance2: fn.getDistance(drone2, fnTarget.creatureIdToPoint(r)),
        // })));

        const distanceDrone1 = fn.getDistance(drone1, fnTarget.creatureIdToPoint(targets[0]));
        const distanceDrone2 = fn.getDistance(drone2, fnTarget.creatureIdToPoint(targets[0]));

        let priorityTo1 = [targets[0], targets[1]];
        let priorityTo2 = [targets[1], targets[0]];

        const drone1Searching = drone1.mission === 'SEARCH' || drone1.mission === 'DOWN';
        const drone2Searching = drone2.mission === 'SEARCH' || drone2.mission === 'DOWN';

        if (targets.length === 1 && drone1Searching && drone2Searching) {
            return [targets[0], targets[0]];
        }

        if (drone1Searching && !drone2Searching) {
            return priorityTo1;
        }
        if (drone2Searching && !drone1Searching) {
            return priorityTo2;
        }

        if (distanceDrone1 < distanceDrone2) {
            return priorityTo1;
        } else {
            return priorityTo2;
        }

    },

    creatureIdToPoint(creatureId: number): Point {
        return fnBbox.getCenter(game.creatureBboxes.find(c => c.creatureId === creatureId));
    },

    getTargets(): number[] {

        const dontScanIt = fnTarget.dontScanIt();

        return game.radars
            .filter(r => fn.isGentil(game.creaturesMetas.get(r.creatureId)))
            .filter(r => !dontScanIt.includes(r.creatureId))
            .map(fn.id)
            .filter(fn.uniq)
            .sort((a, b) => {
                if (game.creaturesMetas.get(a).type > game.creaturesMetas.get(b).type) {
                    return -1;
                }
                if (game.creaturesMetas.get(a).type < game.creaturesMetas.get(b).type) {
                    return 1;
                }
                return fn.distanceXFromCenter(fnTarget.creatureIdToPoint(b)) - fn.distanceXFromCenter(fnTarget.creatureIdToPoint(a));
            })
    },

    getNerestCreatureId(radars: Radar[], d: Drone): number {
        const sorted = radars
            .sort((a, b) => {
                let pa = fnBbox.getCenter(game.creatureBboxes.find(c => c.creatureId === a.creatureId));
                let pb = fnBbox.getCenter(game.creatureBboxes.find(c => c.creatureId === b.creatureId));
                return fn.getDistance(d, pa) - fn.getDistance(d, pb);
            });
        if (sorted.length === 0) {
            return null;
        }
        return sorted[0].creatureId;
    },

    // Ne pas scanner les méchants, ni les créatures déjà scannées, ni ceux validés
    dontScanIt(): number[] {
        return [
            ...game.creaturesMetasArr.filter(fn.isMechant).map(fn.id),
            ...fnTarget.myScanIds(),
            ...game.creaturesValidated.map(fn.id),
        ];
    },

    // Creatures dans des drones, pas encore remontées
    myScanIds(): number[] {
        return game.myDrones.reduce((acc, v) => [...acc, ...v.creaturesScanned], [])
            .filter(v => !game.creaturesValidated.map(fn.id).includes(v)) // Pas utile ?
            .filter(fn.uniq);
    },

    someoneBottomMe(d: Drone) {
        const dontScanIt = fnTarget.dontScanIt();

        return game.radars
            .filter(r => r.droneId === d.droneId)
            .filter(r => !dontScanIt.includes(r.creatureId))
            .some(r => r.direction === 'BL' || r.direction === 'BR')
    },


}
