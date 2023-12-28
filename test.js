
const angles = [
    {angle: 10, distance: 1200},
    {angle: 3, distance: 800},
    {angle: 30, distance: 1200},
    {angle: 8, distance: 700},
    {angle: 190, distance: 1300},
]

const angleWanted = 90;

function substrateAngles(h1, h2) {
    if (h1 < 0 || h1 >= 360) {
        h1 = (h1 % 360 + 360) % 360;
    }
    if (h2 < 0 || h2 >= 360) {
        h2 = (h2 % 360 + 360) % 360;
    }
    const diff = h1 - h2;
    if (diff > -180 && diff <= 180) {
        return diff;
    } else if (diff > 0) {
        return diff - 360;
    } else {
        return diff + 360;
    }
}

let distancePrefered = 1000;
console.log(angles.sort((a, b) => {
    const distanceA = a.distance;
    const distanceB = b.distance;
    if (distanceA > distancePrefered && distanceB < distancePrefered) {
        return -1;
    }
    if (distanceA < distancePrefered && distanceB > distancePrefered) {
        return 1;
    }

    return Math.abs(fn.substrateAngles(a, angleWanted)) - Math.abs(fn.substrateAngles(b, angleWanted));

}));
