import {fn} from "./utils";
import {game} from "../main";
import {fnBbox} from "./bbox";
import {CreatureBbox, Drone, MyDrone, Point, Radar} from "../types";

export const fnTarget = {

    getTargetForDrones(): Radar[] {

        const drone1 = game.myDrones[0];
        const drone2 = game.myDrones[1];

        const targetsDrone1 = fnTarget.getTargets(drone1);
        const targetsDrone2 = fnTarget.getTargets(drone2);

        // console.error(drone1.droneId, targetsDrone1.map(r => ({ id: r.creatureId, ...fnTarget.radarToPoint(r), distance: fn.getDistance(drone1, fnTarget.radarToPoint(r)) })));
        // console.error(drone2.droneId, targetsDrone2.map(r => ({ id: r.creatureId, ...fnTarget.radarToPoint(r), distance: fn.getDistance(drone2, fnTarget.radarToPoint(r)) })));

        if (targetsDrone1[0] && targetsDrone2[0] && targetsDrone1[0].creatureId === targetsDrone2[0].creatureId) {

            const distanceDrone1 = fn.getDistance(drone1, fnTarget.radarToPoint(targetsDrone1[0]));
            const distanceDrone2 = fn.getDistance(drone2, fnTarget.radarToPoint(targetsDrone2[0]));

            let priorityTo1 = [targetsDrone1[0], targetsDrone2[1]];
            let priorityTo2 = [targetsDrone1[1], targetsDrone2[0]];

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


        }

        return [targetsDrone1[0], targetsDrone2[0]];

    },

    radarToPoint(radar): Point {
        return fnBbox.getCenter(game.creatureBboxes.find(c => c.creatureId === radar.creatureId));
    },

    getTargets(d: MyDrone): Radar[] {

        const dontScanIt = fnTarget.dontScanIt();

        return game.radars
            .filter(r => r.droneId === d.droneId)
            .filter(r => fn.isGentil(game.creaturesMetas.get(r.creatureId)))
            .filter(r => !dontScanIt.includes(r.creatureId))
            // .filter(r => !game.myDrones.filter(v => v.droneId !== d.droneId).map(v => v.idCreatureTarget).includes(r.creatureId)) // Pas déjà pris par un autre drone
            .sort((a, b) => {
                let pa = fnBbox.getCenter(game.creatureBboxes.find(c => c.creatureId === a.creatureId));
                let pb = fnBbox.getCenter(game.creatureBboxes.find(c => c.creatureId === b.creatureId));
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
