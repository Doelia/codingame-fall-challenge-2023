import {readline} from "../polyfill";
import {fn} from "./utils";
import {game} from "../main";
import {fnBbox} from "./bbox";
import {Direction, Game} from "../types";

export function initGame() {
    const creatureCount = parseInt(readline());
    for (let i = 0; i < creatureCount; i++) {
        const inputs = readline().split(' ');
        const creatureId = parseInt(inputs[0]);
        const color = parseInt(inputs[1]);
        const type = parseInt(inputs[2]);

        const creature = {creatureId, color, type};
        game.creaturesMetas.set(creatureId, creature);
        game.creaturesMetasArr.push(creature);

    }
}

export function readInputs(game: Game) {


    const myScore = parseInt(readline());
    const vsScore = parseInt(readline());

    // Créatures validées
    const myScanCount = parseInt(readline());
    for (let i = 0; i < myScanCount; i++) {
        const creatureId = parseInt(readline());
        if (!game.creaturesValidated.map(fn.id).includes(creatureId)) {
            game.creaturesValidated.push({
                creatureId,
                turn: game.turnId,
            });
        }
    }
    const foeScanCount = parseInt(readline());
    for (let i = 0; i < foeScanCount; i++) {
        const creatureId = parseInt(readline());
        if (!game.vsCreaturesValidates.map(fn.id).includes(creatureId)) {
            game.vsCreaturesValidates.push({
                creatureId,
                turn: game.turnId,
            });
        }
    }

    // Mes drones
    const myDroneCount = parseInt(readline());
    for (let i = 0; i < myDroneCount; i++) {
        const inputs = readline().split(' ');
        const droneId = parseInt(inputs[0]);
        const x = parseInt(inputs[1]);
        const y = parseInt(inputs[2]);
        const emergency = parseInt(inputs[3]) === 1;
        const battery = parseInt(inputs[4]);

        let d = game.myDrones.find(v => v.droneId === droneId);
        if (d) {
            d.isUpping = d.y > y;
            d.x = x;
            d.y = y;
            d.emergency = emergency;
            d.lightIsOn = battery < d.battery;
            d.battery = battery;
            d.creaturesScanned = [];
        } else {
            game.myDrones.push({
                idx: i,
                droneId, x, y, emergency, battery,
                lastLightTurn: 0,
                angle: 90,
                isUpping: false,
                creaturesScanned: [],
                lightIsOn: false,
                scored: false,
                goDownDone: false,
                mission: null,
            });
        }


        // if (emergency) {
        // d.creaturesScanned = [];
        // }

    }

    // Ses drones
    const foeDroneCount = parseInt(readline());
    for (let i = 0; i < foeDroneCount; i++) {
        var inputs = readline().split(' ');
        const droneId = parseInt(inputs[0]);
        const x = parseInt(inputs[1]);
        const y = parseInt(inputs[2]);
        const emergency = parseInt(inputs[3]) === 1;
        const battery = parseInt(inputs[4]);

        let d = game.vsDrones.find(v => v.droneId === droneId);
        if (d) {
            d.isUpping = d.y > y;
            d.x = x;
            d.y = y;
            d.emergency = emergency;
            d.lightIsOn = battery < d.battery;
            d.battery = battery;
            d.creaturesScanned = [];
        } else {
            game.vsDrones.push({ idx: i, droneId, x, y, emergency, battery, creaturesScanned: [], lightIsOn: false, isUpping: false });
        }
    }

    // Créatures scannées
    const droneScanCount = parseInt(readline());
    for (let i = 0; i < droneScanCount; i++) {
        const inputs = readline().split(' ');
        const droneId = parseInt(inputs[0]);
        const creatureId = parseInt(inputs[1]);
        const d = [...game.myDrones, ...game.vsDrones].find(d => d.droneId === droneId);
        d.creaturesScanned.push(creatureId);
    }

    // Créatures visibles
    game.creaturesVisibles = [];
    const visibleCreatureCount = parseInt(readline());
    for (let i = 0; i < visibleCreatureCount; i++) {
        const inputs = readline().split(' ');
        const creatureId = parseInt(inputs[0]);
        const x = parseInt(inputs[1]);
        const y = parseInt(inputs[2]);
        const vx = parseInt(inputs[3]);
        const vy = parseInt(inputs[4]);

        game.creaturesVisibles.push({ ...game.creaturesMetas.get(creatureId), x, y, vx, vy });
    }

    const radarBlipCount = parseInt(readline());
    game.radars = [];
    for (let i = 0; i < radarBlipCount; i++) {
        const inputs = readline().split(' ');
        const droneId = parseInt(inputs[0]);
        const creatureId = parseInt(inputs[1]);
        const radar = inputs[2] as Direction;

        let creature = game.creaturesMetas.get(creatureId);
        game.radars.push({
            ...creature,
            droneId,
            direction: radar,
        })
    }
}

