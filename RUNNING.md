TODO: The RUNNING.md outlines steps needed to run the application separately for the development mode and the production mode.

# Run the application
Use [docker-compose](https://docs.docker.com/compose/install/) to run the whole application (database included).

## Development configuration

```bash
docker compose up -d
```
## Production configuration

```bash
docker compose -f docker-compose.prod.yml up -d
```

TODO: For merits, the RUNNING.md also outlines the steps needed to use Kubernetes to run the application with Minikube (or somilar), using kubernetes configuration files created as parts of the passing with merits requirements