git pull --rebase
docker stop  skyline-architectes
docker rm  skyline-architectes
docker rm skyline-migrate
docker build -t skyline-migrate -f Dockerfile.migrate .
docker run -it --name  skyline-migrate --network petit  skyline-migrate
docker build -t  skyline-architectes .
docker run -dit --name  skyline-architectes --ip 172.18.0.34 --network petit  skyline-architectes
