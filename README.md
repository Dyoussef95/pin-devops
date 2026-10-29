# TaskFlow — Proyecto Final DevOps

Aplicación web de gestión de tareas con CI/CD, Docker, Terraform,
análisis de seguridad y monitoreo.

## Tecnologías

- Python y Flask: aplicación web y API REST.
- Pytest: pruebas automatizadas.
- GitHub Actions: pipeline CI/CD.
- SonarQube Cloud: análisis estático del código.
- Snyk: análisis de vulnerabilidades de dependencias.
- Docker: construcción y ejecución de contenedores.
- Terraform: infraestructura como código.
- Prometheus: recolección de métricas.
- Grafana: visualización de métricas.
- cAdvisor: métricas de contenedores.
- CycloneDX: formato del SBOM.

## Aplicación

La aplicación permite crear, consultar, actualizar y eliminar tareas.

- `/`: interfaz web.
- `/health`: comprobación de estado.
- `GET /api/tasks`: listar tareas.
- `POST /api/tasks`: crear una tarea.
- `PATCH /api/tasks/<id>`: actualizar una tarea.
- `DELETE /api/tasks/<id>`: eliminar una tarea.

Las tareas se almacenan en memoria y no persisten al reiniciar la aplicación.

## Pruebas

Crear y activar un entorno virtual, instalar las dependencias y ejecutar
las pruebas:

    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    pytest -v

## CI/CD

El workflow `.github/workflows/ci.yml` ejecuta las pruebas, el análisis
con SonarQube Cloud, el análisis de dependencias con Snyk y la construcción
de la imagen Docker.

Los tokens se configuran como secretos de GitHub y no deben guardarse
en el código fuente.

## Terraform

Terraform administra la imagen y el contenedor de TaskFlow.

    terraform init
    terraform validate
    terraform plan
    terraform apply

La aplicación queda disponible en `http://localhost:5001` y su comprobación
de estado en `http://localhost:5001/health`.

Se requiere Docker en funcionamiento. El estado de Terraform es local
y está excluido de Git.

Para eliminar la infraestructura administrada por Terraform:

    terraform destroy

Este comando elimina la imagen y el contenedor administrados por Terraform. Ejecutarlo únicamente cuando se quiera desmontar la aplicación, no durante una demostración normal.

## Monitoreo

Docker Compose administra Prometheus, Grafana y cAdvisor.

    docker compose config
    docker compose up -d
    docker compose ps

- TaskFlow: `http://localhost:5001`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000`

Prometheus utiliza `monitoring/prometheus.yml`. Grafana obtiene su fuente
de datos desde la configuración ubicada en
`monitoring/grafana/provisioning/datasources/prometheus.yml`.

El dashboard permite consultar métricas de CPU, actividad de disco y
tráfico de red de los contenedores.

Para detener los servicios de Compose:

    docker compose down

Este comando detiene y elimina los contenedores administrados por Compose.
Conserva los volúmenes nombrados mientras no se eliminen explícitamente.
No elimina el contenedor taskflow-terraform, administrado por Terraform.

## SBOM

El archivo `sbom.cyclonedx.json` contiene el inventario de componentes
Python detectados en el entorno virtual utilizado para generarlo.

Para validar su formato JSON:

    python3 -m json.tool sbom.cyclonedx.json > /dev/null

## Archivos principales

- `.github/workflows/ci.yml`: pipeline CI/CD.
- `app/`: aplicación web.
- `tests/`: pruebas automatizadas.
- `Dockerfile`: imagen de la aplicación.
- `compose.yaml`: servicios de monitoreo.
- `main.tf` y `outputs.tf`: configuración de Terraform.
- `.terraform.lock.hcl`: versiones bloqueadas del proveedor.
- `monitoring/`: configuración de Prometheus y Grafana.
- `sbom.cyclonedx.json`: SBOM en formato CycloneDX.

## Consideraciones

La ejecución del análisis SonarQube Cloud y Snyk requiere sus secretos
configurados en GitHub Actions.

La configuración actual de Terraform utiliza el socket local de Docker.
