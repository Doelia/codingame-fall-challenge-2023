

## TODO

- quand il reste qu'un poisson, c'est le plus proche qui doit y aller
- évitement :
    - tester si on va se faire manger en N+1
- Revoir la stratégie points

## Developpement

Watch :
```
fswatch -o src | xargs -n1 -I{} $(pwd)/build.sh
```
