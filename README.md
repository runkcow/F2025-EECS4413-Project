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

The application can be run locally with docker using the commands stated above.
However, to run it locally without using docker, run "node server.js" while the current directory is "root/backend"

To run the website in development, respective code lines in server.js needs to be removed and api urls of frontend needs to be 
changed to reflect the localhost port of backend. Then the backend and frontend can be run separately, "npm run dev" for the frontend.

To run this project on an EC2 instance (ubuntu), create a docker image on the home computer and copy the file onto the ubuntu.
First, create a .tar file of the docker image using "docker save -o myimage.tar myimage:latest".
Then copy the .tar file to the EC2 instance using "scp -i your-key.pem localfile.txt ec2-user@EC2_PUBLIC_IP:/home/ec2-user/"
Connect to the EC2 instance and load the .tar file using "docker load -i myimage.tar".
The loaded docker can now be run using previously stated commands on the EC2 instance. 
