import {fn} from "./utils";
import {COLORS, game, TYPES} from "../main";

export const fnPoints = {

    // TODO pas sur de mon bordel de turns

    pointsIfIUpNow: function(myScansIds: number[]) {

        const myturnToUp = Math.max(...game.myDrones.map(fn.turnToUp));

        return fnPoints.computePoints(
            [
                ...game.creaturesValidated,
                ...myScansIds.map(id => ({creatureId: id, turn: game.turnId + myturnToUp})),
            ],
            game.vsCreaturesValidates
        );
    },

    pointsVsIfUpAtEnd: function(myScansIds: number[], vsScansIds: number[]) {

        const inRadarsIds = game.radars.map(fn.id);

        let stay = game.creaturesMetasArr
            .map(fn.id)
            .filter(v => game.creaturesMetas.get(v).type !== -1)
            .filter(v => !game.vsCreaturesValidates.map(fn.id).includes(v))
            .filter(v => inRadarsIds.includes(v))
            .filter(v => !vsScansIds.includes(v))
            .map(id => ({creatureId: id, turn: 200}));

        const myturnToUp = Math.max(...game.myDrones.map(fn.turnToUp));
        const vsturnToUp = Math.max(...game.vsDrones.map(fn.turnToUp));

        return fnPoints.computePoints(
            [
                ...game.vsCreaturesValidates,
                ...vsScansIds.map(id => ({creatureId: id, turn: game.turnId + vsturnToUp})),
                ...stay,
            ],
            [
                ...game.creaturesValidated,
                ...myScansIds.map(id => ({creatureId: id, turn: game.turnId + myturnToUp})),
            ],
        );
    },

    pointOfFish(idCreature, isFirst) {
        return (game.creaturesMetas.get(idCreature).type + 1) * (isFirst ? 2 : 1);
    },

    computePoints(validated, vsValidated) {

        let points = 0;

        for (let f of validated) {
            let {creatureId} = f;
            const isVsValidated = vsValidated.find(v => v.creatureId === creatureId);
            const imFirst = !isVsValidated || f.turn < isVsValidated.turn;
            points += fnPoints.pointOfFish(creatureId, imFirst);
        }

        for (let type of TYPES) {
            let metaNOfType = game.creaturesMetasArr.filter(v => v.type === type).length;
            let fishesOfType = validated.filter(v => game.creaturesMetas.get(v.creatureId).type === type);
            let vsFishesOfType = vsValidated.filter(v => game.creaturesMetas.get(v.creatureId).type === type);

            if (metaNOfType === fishesOfType.length) {
                points += 4;

                if (vsFishesOfType.length < metaNOfType) {
                    points += 4;
                } else {
                    const jaiToutAuTour = Math.max(fishesOfType.map(v => v.turn));
                    const ilAToutAuTour = Math.max(vsFishesOfType.map(v => v.turn));
                    if (jaiToutAuTour < ilAToutAuTour) {
                        points += 4;
                    }
                }

            }
        }

        for (let color of COLORS) {
            let metaNOfColor = game.creaturesMetasArr.filter(v => v.color === color).length;
            let fishesOfColor = validated.filter(v => game.creaturesMetas.get(v.creatureId).color === color);
            let vsFishesOfColor = vsValidated.filter(v => game.creaturesMetas.get(v.creatureId).color === color);

            if (metaNOfColor === fishesOfColor.length) {
                points += 3;

                if (vsFishesOfColor.length < metaNOfColor) {
                    points += 3;
                } else {
                    const jaiToutAuTour = Math.max(fishesOfColor.map(v => v.turn));
                    const ilAToutAuTour = Math.max(vsFishesOfColor.map(v => v.turn));
                    if (jaiToutAuTour < ilAToutAuTour) {
                        points += 3;
                    }
                }

            }
        }

        return points;

    }
}
