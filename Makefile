rmsqldbcontainer:
	docker stop lfsdb
	docker rm lfsdb

sqldbcontainer:
	docker run --name lfsdb -e MYSQL_ROOT_PASSWORD=Goldendragon1375 -p 3306:3306 -d mysql:8.2.0 

createdb:
	docker exec -it lfsdb  mysql -u root -p -e "create database lifestyle;"

dropdb:
	docker exec -it lfsdb  mysql -u root -p -e "drop database lifestyle;"

migrate:
	migrate -path lifeStyleBack/db/migration -database "mysql://root:Goldendragon1375@tcp(localhost:3306)/lifestyle" -verbose up