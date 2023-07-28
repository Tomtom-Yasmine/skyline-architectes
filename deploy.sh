git pull --rebase
docker stop  skyline-architectes
docker rm  skyline-architectes
docker build -t  skyline-architectes .
docker run -dit --name  skyline-architectes --ip 172.18.0.34 --network petit  skyline-architectes