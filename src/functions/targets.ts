import {fn} from "./utils";
import {game} from "../main";
import {fnBbox} from "./bbox";
import {CreatureBbox} from "../types";

export const fnTarget = {

    getTargets(d, myScansIds, bboxes: CreatureBbox[]) {

        const dontScanIt = [
            ...myScansIds,
            ...game.creaturesValidated.map(fn.id),
        ];

        return game.radars
            .filter(r => r.droneId === d.droneId)
            .filter(r => fn.isGentil(game.creaturesMetas.get(r.creatureId)))
            .filter(r => !dontScanIt.includes(r.creatureId))
            // .filter(r => !game.myDrones.filter(v => v.droneId !== d.droneId).map(v => v.idCreatureTarget).includes(r.creatureId)) // Pas déjà pris par un autre drone
            .sort((a, b) => {
                let pa = fnBbox.getCenter(bboxes.find(c => c.creatureId === a.creatureId));
                let pb = fnBbox.getCenter(bboxes.find(c => c.creatureId === b.creatureId));
                return fn.getDistance(pa, d) - fn.getDistance(pb, d);
            })
    },

}
