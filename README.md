

## TODO

- quand il reste qu'un poisson, c'est le plus proche qui doit y aller
- évitement :
    - tester si on va se faire manger en N+1
- Revoir la stratégie points
- light : Allumer en continue quand y > 6500 et que les target sont sous moi
- score : si égalité, pas de double
- quand on a eu tous les targets du bas, désacctiver le down et mettre l'angle vers le haut

## Developpement

Watch :
```
fswatch -o src | xargs -n1 -I{} $(pwd)/build.sh
```
