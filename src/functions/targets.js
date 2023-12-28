import { fn } from "./utils";
import { game } from "../main";
export const fnTarget = {
    getTargets(d, myScansIds) {
        const dontScanIt = [
            ...myScansIds,
            ...game.creaturesValidated.map(fn.id),
        ];
        return game.radars
            .filter(r => r.droneId === d.droneId)
            .filter(r => game.creaturesMetas.get(r.creatureId).color !== -1)
            .filter(r => !dontScanIt.includes(r.creatureId))
            .filter(r => !game.myDrones.filter(v => v.droneId !== d.droneId).map(v => v.idCreatureTarget).includes(r.creatureId)) // Pas déjà pris par un autre drone
            .sort((a, b) => {
            let pa = this.radarToPosition(d, a);
            let pb = this.radarToPosition(d, b);
            return fn.getDistance(pa, d) - fn.getDistance(pb, d);
        });
    },
    radarToAngle: function (d, radar) {
        const target = this.radarToPosition(d, radar);
        return fn.angleTo(d, target);
    },
    translatePositionToFishType(position, fishType) {
        const [min, max] = fn.fishTypeToMinMaxY(fishType);
        return {
            x: position.x,
            y: Math.min(Math.max(position.y, min), max),
        };
    },
    radarDirectionToTarget: function (direction) {
        const PADDING = 500;
        switch (direction) {
            case 'TL': return { x: PADDING, y: 0 };
            case 'TR': return { x: 10000 - PADDING, y: 0 };
            case 'BR': return { x: 10000 - PADDING, y: 10000 };
            case 'BL': return { x: PADDING, y: 10000 };
        }
    },
    radarToPosition: function (d, radar) {
        let target = this.radarDirectionToTarget(radar.direction);
        let fishType = game.creaturesMetas.get(radar.creatureId).type;
        return this.translatePositionToFishType(target, fishType);
    },
};
