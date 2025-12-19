F2025 EECS4413 Project

Source code located at github:<br>
https://github.com/runkcow/F2025-EECS4413-Project

Website hosted on AWS EC2 instance at:<br>
http://18.189.185.109/

Instructions on how to run:<br>
Download the files from github.<br>
Create an ".env" file that contains "JWT_SECRET={token}"<br>
Where {token} is the token, do not include curly brackets '{' & '}'<br>
Build docker image with "docker build -t my-app ."<br>
Run docker container with "docker run -d -p 80:80 --env-file .env my-app"<br>
Get container_id with "docker ps"<br>
Start container with "docker start {container_id}"<br>
Stop container with "docker stop {container_id}"<br>
Remove container with "docker rm {container_id}"

Docker Desktop will be required for Windows<br>
Commands may need to be prefixed with "sudo " on Linux machines
