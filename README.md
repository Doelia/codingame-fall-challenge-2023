

## TODO

- évitement :
    - tester si on va se faire manger en N+1
    - calculer les méchants à tout instant une fois qu'ils ont été vu une fois
- bouh : prédire ce que vs va scan

## Developpement

Watch :
```
fswatch -o src | xargs -n1 -I{} $(pwd)/build.sh
```
