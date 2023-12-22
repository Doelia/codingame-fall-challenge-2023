// if (!readline) { function readline() { } }

// seed 6 poissons : seed=1404408027432733000

const game = {
    turnId: 0,
    myDrones: [],
    creaturesMetas: [],
    creaturesVisibles: [],
    creaturesScanned: [],
    creaturesValidated: [],
    radars: [],
    nMonsters: 0,
}

let fn = {
    getDistance: (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)),
    samePoint: (p1, p2) => p1.x === p2.x && p1.y === p2.y,
    radarDirectionToAngle: function (radar) {
        switch (radar) {
            case 'TL': return 45 + 90*2;
            case 'TR': return 45 + 90*3;
            case 'BR': return 45;
            case 'BL': return 45 + 90;
        }
    },
    reversePoint: function(p) {
        return { x: -p.x, y: -p.y, }
    },
    toRadians: (degrees) => degrees * Math.PI / 180,
    toDegrees: (radians)  => radians * 180 / Math.PI,
    cos: (degrees) => Math.cos(fn.toRadians(degrees)),
    sin: (degrees) =>  Math.sin(fn.toRadians(degrees)),
    turnAtMost(angle, turn, max=360) {
        if (Math.abs(turn) > max) {
            return angle + (turn > 0 ? max : -max);
        } else {
            return angle + turn;
        }
    },
    moveToAngleAtMost(angle, angleTarget, max=360) {
        let sub = fn.substrateAngles(angleTarget, angle);
        return fn.turnAtMost(angle, sub, max);
    },
    angleTo: (from, to) => fn.toDegrees(Math.atan2(to.y - from.y, to.x - from.x)),
    forward: (p, angle, dist=10000) => ({
        x: Math.round(p.x + fn.cos(angle) * dist),
        y: Math.round(p.y + fn.sin(angle) * dist),
    }),
    wiggle: (angle, maxAngle) => fn.moduloAngle(angle + (Math.random() * maxAngle) - (Math.random() * maxAngle)),
    moduloAngle: (angle) => (angle % 360) > 0 ? (angle % 360) : (angle % 360) + 360,
    substrateAngles(h1, h2) {
        if (h1 < 0 || h1 >= 360) {
            h1 = (h1 % 360 + 360) % 360;
        }
        if (h2 < 0 || h2 >= 360) {
            h2 = (h2 % 360 + 360) % 360;
        }
        var diff = h1 - h2;
        if (diff > -180 && diff <= 180) {
            return diff;
        } else if (diff > 0) {
            return diff - 360;
        } else {
            return diff + 360;
        }
    }
}

let fn2 = {
    sortRadars(radars) {
        let monsterPerDirection = { TL: 0, TR: 0, BR: 0, BL: 0, };
        for (let r of radars) {
            if (game.creaturesMetas[r.creatureId].type === -1) {
                monsterPerDirection[r.direction]++;
            }
        }
        return radars.sort((a, b) => monsterPerDirection[a.direction] - monsterPerDirection[b.direction]);
    },

    bestAngleAvoiding(monsters, d, angleWanted) {

        // ILs sont dangereux s'ils sont capables de me manger au prochain tour
        function getDangerours(monsters, d, angle) {
            return monsters.filter(monster => {
                for (let i = 0; i < 100; i++) {
                    let monsterAngle = fn.angleTo(monster, d);
                    let nextPositionMonster = fn.forward(monster, monsterAngle, i/100 * 540);
                    let nextMyPosition = fn.forward(d, angle, i/100 * 600);
                    let distance = fn.getDistance(nextPositionMonster, nextMyPosition);
                    if (distance <= 500) {
                        return true;
                    }
                }
                return false;
            });
        }

        for (let i = 0; i <= 180; i++) {
            let angle = fn.moduloAngle(angleWanted + i);
            if (getDangerours(monsters, d, angle).length === 0) {
                return angle;
            }
            angle = fn.moduloAngle(angleWanted - i);
            if (getDangerours(monsters, d, angle).length === 0) {
                return angle;
            }
        }

        return angleWanted;
    }
}
function initGame() {
    const creatureCount = parseInt(readline());
    for (let i = 0; i < creatureCount; i++) {
        const inputs = readline().split(' ');
        const creatureId = parseInt(inputs[0]);
        const color = parseInt(inputs[1]);
        const type = parseInt(inputs[2]);

        game.creaturesMetas[creatureId] = {creatureId, color, type};
    }
    game.nMonsters = game.creaturesMetas.filter(v => v.type === -1).length;
}

function updateGame() {

    game.turnId++;

    const myScore = parseInt(readline());
    const foeScore = parseInt(readline());

    // Créatures validées
    const myScanCount = parseInt(readline());
    for (let i = 0; i < myScanCount; i++) {
        const creatureId = parseInt(readline());
        if (!game.creaturesValidated.includes(creatureId)) {
            game.creaturesValidated.push(creatureId);
        }
    }
    const foeScanCount = parseInt(readline());
    for (let i = 0; i < foeScanCount; i++) {
        const creatureId = parseInt(readline());
    }

    // Mes drones
    const myDroneCount = parseInt(readline());
    for (let i = 0; i < myDroneCount; i++) {
        var inputs = readline().split(' ');
        const droneId = parseInt(inputs[0]);
        const x = parseInt(inputs[1]);
        const y = parseInt(inputs[2]);
        const emergency = parseInt(inputs[3]);
        const battery = parseInt(inputs[4]);

        let d = game.myDrones.find(v => v.droneId === droneId);
        if (d) {
            d.x = x;
            d.y = y;
        } else {
            game.myDrones.push({
                idx: i,
                droneId, x, y, emergency, battery,
                up: false,
                lastLightTurn: 0,
                angle: 90,
                idCreatureTarget: null,
                creaturesScanned: [],
            });
        }

        if (emergency) {
            d.creaturesScanned = [];
        }

    }

    // Ses drones
    const foeDroneCount = parseInt(readline());
    for (let i = 0; i < foeDroneCount; i++) {
        var inputs = readline().split(' ');
        const droneId = parseInt(inputs[0]);
        const droneX = parseInt(inputs[1]);
        const droneY = parseInt(inputs[2]);
        const emergency = parseInt(inputs[3]);
        const battery = parseInt(inputs[4]);
    }

    // Créatures scannées
    const droneScanCount = parseInt(readline());
    for (let i = 0; i < droneScanCount; i++) {
        var inputs = readline().split(' ');
        const droneId = parseInt(inputs[0]);
        const creatureId = parseInt(inputs[1]);

        let myDrone = game.myDrones.find(d => d.droneId === droneId);
        if (myDrone) {
            if (!myDrone.creaturesScanned.includes(creatureId)) {
                myDrone.creaturesScanned.push(creatureId);
            }
        }

    }

    // Créatures visibles
    game.creaturesVisibles = [];
    const visibleCreatureCount = parseInt(readline());
    for (let i = 0; i < visibleCreatureCount; i++) {
        var inputs = readline().split(' ');
        const creatureId = parseInt(inputs[0]);
        const x = parseInt(inputs[1]);
        const y = parseInt(inputs[2]);
        const vx = parseInt(inputs[3]);
        const vy = parseInt(inputs[4]);

        let creature = game.creaturesMetas[creatureId];
        game.creaturesVisibles.push({ ...creature, x, y, vx, vy });
    }

    const radarBlipCount = parseInt(readline());
    game.radars = [];
    for (let i = 0; i < radarBlipCount; i++) {
        var inputs = readline().split(' ');
        const droneId = parseInt(inputs[0]);
        const creatureId = parseInt(inputs[1]);
        const radar = inputs[2];

        let creature = game.creaturesMetas[creatureId];
        game.radars.push({
            ...creature,
            droneId,
            direction: radar,
        })
    }
}

initGame();

while (true) {

    updateGame();

    for (let d of game.myDrones) {
        if (d.y <= 500) {
            d.creaturesScanned = [];
            d.idCreatureTarget = null;
        }
    }

    let allScanned = [
        ...game.myDrones[0].creaturesScanned,
        ...game.myDrones[1].creaturesScanned,
        ...game.creaturesValidated,
    ];

    for (let d of game.myDrones) {

        let debug = [];

        let monstersVisibles = game.creaturesVisibles
            .filter(c => c.type === -1)
            .filter(c => fn.getDistance(c, d) < 2000)
            .sort((a, b) => fn.getDistance(a, d) - fn.getDistance(b, d))


        let visibleFishes = game.creaturesVisibles
            .sort((a, b) => fn.getDistance(a, d) - fn.getDistance(b, d))
            .filter(c => fn.getDistance(c, d) < 2000)
            .map(c => c.creatureId)

        let radarsSorted = fn2.sortRadars(game.radars.filter(r => r.droneId === d.droneId));

        let toCatch = radarsSorted
            .filter(r => game.creaturesMetas[r.creatureId].color !== -1)
            .filter(r => !allScanned.includes(r.creatureId))
            .filter(r => !game.myDrones.filter(v => v.droneId !== d.droneId).map(v => v.idCreatureTarget).includes(r.creatureId)) // Pas déjà pris par un autre drone

        if (toCatch[0]) {
            if (
                !d.idCreatureTarget // Plus de target
                // || monsters.length > 0 // il y a un monstre
                || allScanned.includes(d.idCreatureTarget) // il a été scanné
                || !game.radars.map(v => v.creatureId).includes(d.idCreatureTarget) // on le trouve plus sur la map
            ) {
                debug.push('NT=' + toCatch[0]?.creatureId);
                d.idCreatureTarget = toCatch[0]?.creatureId;
            }
        }

        debug.push('T=' + d.idCreatureTarget);

        let radarOfTarget = toCatch.find(r => r.creatureId === d.idCreatureTarget);
        if (radarOfTarget) {
            let angleToTarget = fn.radarDirectionToAngle(radarOfTarget.direction);
            d.angle = fn.moduloAngle(fn.moveToAngleAtMost(d.angle, angleToTarget, 45));
        }

        if (
            !toCatch[0] // Plus rien à attraper
            // || d.creaturesScanned.length >= 5 // On a scanné assez de créatures
        ) {
            debug.push('UP');
            d.angle = 270;
        }

        debug.push('F=' + d.creaturesScanned.length);

        d.angle = fn2.bestAngleAvoiding(monstersVisibles, d, d.angle);

        let light = false;

        // On allume la light si ça fait longtemps
        if (game.turnId - d.lastLightTurn >= 4) {
            if (d.y > 2000) {
                light = true;
            }
        }

        let goTo = fn.forward(d, d.angle);

        if (light) {
            debug.push('LIGHT');
            d.lastLightTurn = game.turnId;
        }

        console.log('MOVE ' + goTo.x + ' ' + goTo.y + ' ' + (light?1:0) + ' ' + debug.join(' '))

    }
}
