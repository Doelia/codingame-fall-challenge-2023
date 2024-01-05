

## TODO

- améliorer la trajectoire du début
- évitement: tester si on va se faire manger en N+1
- idées remontée : mesure le score avec les distances
- ne pas remonter jusqu'a y=0
- idée start : s'il remonte et que je perd en score, chasser à tout prix
- Mieux cibler les bbox de départ
- 

à tester :
- enlargeWithMovement avec le moteur

## Developpement

Watch :
```
fswatch -o src | xargs -n1 -I{} $(pwd)/build.sh
```
