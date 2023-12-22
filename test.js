
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

console.log(fn.turnAtMost(90, 40, 20), 110);
console.log(fn.moduloAngle(fn.turnAtMost(0, -10, 20)), 350);
console.log(fn.moduloAngle(fn.turnAtMost(350, 40, 20)), 10);
console.log(fn.moduloAngle(fn.moveToAngleAtMost(0, 90, 45)), 45);
console.log(fn.moduloAngle(fn.moveToAngleAtMost(90, 0, 45)), 45);
console.log(fn.moduloAngle(fn.moveToAngleAtMost(90, -20, 360)), 340);
