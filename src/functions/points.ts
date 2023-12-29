import {fn} from "./utils";
import {COLORS, game, TYPES} from "../main";
import {Drone, Game} from "../types";


// Bug seed 240095120131088830 vs WhatTrickeryIsThis

export const fnPoints = {

    pointsIfIUpNow: function(lastGame: Game) {

        const inRadarsIds = game.radars.map(fn.id);

        const myValidated = [...game.creaturesValidated];

        for (let d of game.myDrones) {
            for (let id of d.creaturesScanned) {
                myValidated.push({
                    creatureId: id,
                    turn: game.turnId + fn.turnToUp(d)
                })
            }
        }

        for (let c of game.creaturesMetasArr) {
            if (fn.isGentil(c) && inRadarsIds.includes(c.creatureId)) {
                myValidated.push({
                    creatureId: c.creatureId,
                    turn: 200
                })
            }
        }

        const vsValidated = [...game.vsCreaturesValidates];
        for (let d of game.vsDrones) {

            const lastD = lastGame.vsDrones.find(v => v.droneId === d.droneId);
            // const ilRemonte = lastD && d.y < lastD.y; // miieux si on met true ?
            const ilRemonte = true;

            for (let id of d.creaturesScanned) {
                vsValidated.push({
                    creatureId: id,
                    turn: ilRemonte ? (game.turnId + fn.turnToUp(d)) : 199
                })
            }
        }

        for (let c of game.creaturesMetasArr) {
            if (fn.isGentil(c) && inRadarsIds.includes(c.creatureId)) {
                vsValidated.push({
                    creatureId: c.creatureId,
                    turn: 199
                })
            }
        }

        // console.error('myValidated', myValidated);
        // console.error('vsValidated', vsValidated);

        return [
            fnPoints.computePoints(myValidated, vsValidated),
            fnPoints.computePoints(vsValidated, myValidated),
        ];
    },

    pointsVsIfUpAtEnd: function() {

        const inRadarsIds = game.radars.map(fn.id);

        let scanned = game.myDrones.map(d => {
            return d.creaturesScanned.map(id => {
                return {creatureId: id, turn: game.turnId + fn.turnToUp(d)};
            })
        }).reduce(fn.concat, []);

        let vsScanned = game.vsDrones.map(d => {
            return d.creaturesScanned.map(id => {
                return {creatureId: id, turn: game.turnId + fn.turnToUp(d)};
            })
        }).reduce(fn.concat, []);

        let stay = game.creaturesMetasArr
            .map(fn.id)
            .filter(id => fn.isGentil(game.creaturesMetas.get(id)))
            .filter(id => !game.vsCreaturesValidates.map(fn.id).includes(id))
            .filter(id => inRadarsIds.includes(id))
            .filter(id => !vsScanned.map(fn.id).includes(id))
            .map(id => ({creatureId: id, turn: 200}));

        return fnPoints.computePoints(
            [
                ...game.vsCreaturesValidates,
                ...vsScanned,
                ...stay,
            ],
            [
                ...game.creaturesValidated,
                ...scanned
            ],
        );
    },

    pointOfFish(idCreature, isFirst) {
        return (game.creaturesMetas.get(idCreature).type + 1) * (isFirst ? 2 : 1);
    },

    computePoints(validated, vsValidated) {

        // Retirer des doublons TODO trier par tour
        validated = validated
            .sort((a, b) => a.turn - b.turn)
            .filter((v, i, a) => a.map(fn.id).indexOf(v.creatureId) === i);

        vsValidated = vsValidated
            .sort((a, b) => a.turn - b.turn)
            .filter((v, i, a) => a.map(fn.id).indexOf(v.creatureId) === i);

        let points = 0;

        for (let f of validated) {
            let {creatureId} = f;
            const isVsValidated = vsValidated.find(v => v.creatureId === creatureId);
            const imFirst = !isVsValidated || f.turn < isVsValidated.turn;
            const wind = fnPoints.pointOfFish(creatureId, imFirst);
            points += wind;
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
                    const jaiToutAuTour = Math.max(...fishesOfType.map(v => v.turn));
                    const ilAToutAuTour = Math.max(...vsFishesOfType.map(v => v.turn));

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
                    const jaiToutAuTour = Math.max(...fishesOfColor.map(v => v.turn));
                    const ilAToutAuTour = Math.max(...vsFishesOfColor.map(v => v.turn));
                    if (jaiToutAuTour < ilAToutAuTour) {
                        points += 3;
                    }
                }

            }
        }

        return points;

    }
}
