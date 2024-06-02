# Prerequisites
- Docker
- Kubernete cluster: recommended to be deployed by minikube as instructed in this course. However, if you can not use minikube, just trying any feasible methods to have a Kubernete cluster on your local machine. In my case, I also can used [Kind - Kubernete](https://kind.sigs.k8s.io/) to easily create my own K8S cluster
- kubectl: that is configured to use with your Kubernete cluster

All the commands listed below are used with the assumption that you are in the original folder of the project

If there is some of my commands for loading Docker images into the K8S cluster that are not correct, please help me correct them with your own commands. The target is basically building the Docker image in your local machine and loading it into the K8S cluster.

# Database

Run the commands below to deploy database cluster
```
kubectl apply -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.19/releases/cnpg-1.19.1.yaml

kubectl get all -n cnpg-system

kubectl apply -f kubernetes/database-cluster.yaml
```
# Flyway to database migration
After succesfully deploying the database cluster, run the commands below to migrate initial data to the database
```
cd flyway

minikube image build -t database-migrations -f ./Dockerfile .

cd ../

kubectl apply -f kubernetes/database-migration-job.yaml
```
# Redis
Run the command below to deploy redis cluster
```
kubectl apply -f kubernetes/redis -R
```
# Applications
Run the commands below that are corresponding to each application to deploy all applications
## llm-api
```
cd llm-api
minikube image build -t llm-api -f ./Dockerfile .
cd ../
kubectl apply -f kubernetes/llm-api -R
```
## qa-api
```
cd qa-api
minikube image build -t qa-api -f ./Dockerfile .
cd ../
kubectl apply -f kubernetes/qa-api-deployment.yaml
kubectl apply -f kubernetes/qa-api-service.yaml
```
## answer-generator
```
cd answer-generator
minikube image build -t answer-generator -f ./Dockerfile .
cd ../
kubectl apply -f kubernetes/answer-generator-deployment.yaml
```
## data-updater
```
cd data-updater
minikube image build -t data-updater -f ./Dockerfile .
cd ../
kubectl apply -f kubernetes/data-updater-deployment.yaml
kubectl apply -f kubernetes/data-updater-service.yaml
```
## qa-ui
```
cd qa-ui
minikube image build -t qa-ui -f ./Dockerfile .
cd ../
kubectl apply -f kubernetes/qa-ui-deployment.yaml
kubectl apply -f kubernetes/qa-ui-service.yaml
```
# nginx
Run the command below to deploy NGINX server
```
kubectl apply -f kubernetes/nginx -R
```
# Access to the application
After successfully deploying all the above applications, run below command to forward to port of local machine to the port of the NGINX service
```
kubectl port-forward service/nginx 7800:7800
```
Then you can access the application from [localhost:7800](http://localhost:7800)

# Conclusion
I have successfully deployed the whole appplication on K8S and all the functionalities can work the same as the application deployed by Docker compose.

The PostgreSQL database and Redis cluster are deployed as scalable clusters that can be used in production.

All the deployment can be easily scaled up with scale command of K8S.