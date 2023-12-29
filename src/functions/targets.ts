import {fn} from "./utils";
import {game} from "../main";
import {fnBbox} from "./bbox";
import {CreatureBbox, Drone, MyDrone, Point, Radar} from "../types";

export const fnTarget = {

    getTargetForDrones(): number[] {

        const drone1 = game.myDrones[0];
        const drone2 = game.myDrones[1];

        const targets = fnTarget.getTargets();

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

        if (drone2.state !== 'SEARCH') {
            return priorityTo1;
        }
        if (drone1.state !== 'SEARCH') {
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
            // .filter(r => !game.myDrones.filter(v => v.droneId !== d.droneId).map(v => v.idCreatureTarget).includes(r.creatureId)) // Pas déjà pris par un autre drone
            .sort((a, b) => {
                let pa = fnBbox.getCenter(game.creatureBboxes.find(c => c.creatureId === a));
                let pb = fnBbox.getCenter(game.creatureBboxes.find(c => c.creatureId === b));
                return pb.y - pa.y;
                // return fn.getDistance(pa, d) - fn.getDistance(pb, d);
            })
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
