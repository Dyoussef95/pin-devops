# TaskFlow — Proyecto Final DevOps

Aplicación web de gestión de tareas desarrollada con Flask. El proyecto integra pruebas automatizadas, CI/CD con GitHub Actions, análisis de código y dependencias, contenedorización con Docker, infraestructura como código con Terraform y monitoreo con Prometheus, Grafana y cAdvisor.

## 1. Estructura del proyecto

```text
pin-devops/
├── .github/workflows/ci.yml       # Pipeline CI/CD
├── app/                           # Aplicación Flask
├── tests/                         # Pruebas automatizadas
├── monitoring/
│   ├── prometheus.yml             # Configuración de Prometheus
│   └── grafana/
│       └── provisioning/
│           └── datasources/
│               └── prometheus.yml # Fuente de datos de Grafana
├── docs/evidencias/
│   └── grafana-dashboard.png      # Captura del dashboard
├── security/
│   └── sbom.cyclonedx.json        # Inventario de componentes
├── Dockerfile                     # Imagen de TaskFlow
├── compose.yaml                   # Servicios de monitoreo
├── main.tf                        # Infraestructura Docker con Terraform
├── outputs.tf                     # Salidas de Terraform
├── requirements.txt               # Dependencias Python
├── sonar-project.properties       # Configuración de SonarQube
├── .terraform.lock.hcl            # Versiones bloqueadas del proveedor
└── README.md                      # Documentación principal
```

El estado local de Terraform (`terraform.tfstate`) y los directorios de trabajo no forman parte de la entrega.

## 2. Tecnologías

- Python 3.12 y Flask.
- Pytest para pruebas automatizadas.
- GitHub Actions para integración y despliegue continuo.
- SonarQube Cloud para análisis estático.
- Snyk para análisis de vulnerabilidades de dependencias.
- Docker para construir y ejecutar la aplicación.
- Terraform para administrar la imagen y el contenedor.
- Prometheus para recolectar métricas.
- Grafana para visualizar métricas.
- cAdvisor para métricas de contenedores.
- CycloneDX para el SBOM.

## 3. Aplicación

TaskFlow permite crear, consultar, actualizar y eliminar tareas.

| Método | Ruta | Función |
|---|---|---|
| GET | `/` | Interfaz web |
| GET | `/health` | Comprobación de estado |
| GET | `/api/tasks` | Listar tareas |
| POST | `/api/tasks` | Crear una tarea |
| PATCH | `/api/tasks/<id>` | Actualizar una tarea |
| DELETE | `/api/tasks/<id>` | Eliminar una tarea |

**Limitación conocida:** las tareas se almacenan en memoria y se pierden cuando se reinicia la aplicación.

## 4. Ejecución de pruebas

Desde la raíz del proyecto:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m pytest -v
```

## 5. Integración y despliegue continuo (CI/CD)

El workflow se encuentra en `.github/workflows/ci.yml`.

El pipeline contempla:

1. Ejecución de pruebas automatizadas.
2. Análisis estático con SonarQube Cloud.
3. Análisis de dependencias con Snyk.
4. Construcción de la imagen Docker.
5. Despliegue en la VM Ubuntu mediante un runner self-hosted, condicionado a un `push` a la rama `main` y al éxito de los jobs anteriores.
6. Verificación de salud mediante `/health`.

Los tokens `SONAR_TOKEN` y `SNYK_TOKEN` se configuran como secretos del repositorio en GitHub. No deben guardarse en el código fuente.

El runner self-hosted debe estar conectado y disponible para ejecutar el job de despliegue.

## 6. Docker y Terraform

El `Dockerfile` define la imagen de TaskFlow. Terraform administra la imagen y el contenedor mediante el proveedor Docker.

Comandos principales:

```bash
terraform init
terraform validate
terraform plan
terraform apply
```

La aplicación queda disponible en:

- Aplicación: `http://localhost:5001`
- Comprobación de salud: `http://localhost:5001/health`

Se requiere Docker en funcionamiento y acceso al socket local de Docker.

El estado de Terraform se guarda localmente y no debe incluirse en Git ni en el ZIP de entrega. No se debe eliminar ese estado mientras Terraform administre recursos existentes.

Para desmontar la infraestructura administrada por Terraform:

```bash
terraform destroy
```

Ejecutar únicamente cuando se quiera eliminar la aplicación administrada por Terraform.

## 7. Monitoreo

Docker Compose administra Prometheus, Grafana y cAdvisor.

Validar y levantar los servicios:

```bash
docker compose config
docker compose up -d
docker compose ps
```

Accesos locales:

- TaskFlow: `http://localhost:5001`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000`

Prometheus utiliza `monitoring/prometheus.yml`. Grafana obtiene su fuente de datos desde `monitoring/grafana/provisioning/datasources/prometheus.yml`.

El dashboard permite consultar métricas de uso de CPU, actividad de disco y tráfico de red de los contenedores. La captura de evidencia está en `docs/evidencias/grafana-dashboard.png`.

Para detener los servicios administrados por Compose:

```bash
docker compose down
```

Esto no elimina los volúmenes nombrados ni el contenedor de TaskFlow administrado por Terraform.

## 8. Seguridad y SBOM

El inventario de componentes en formato CycloneDX está en:

`security/sbom.cyclonedx.json`

Validar que el archivo tenga formato JSON correcto:

```bash
python3 -m json.tool security/sbom.cyclonedx.json > /dev/null
```

El SBOM documenta los componentes incluidos en el inventario generado. El análisis de dependencias se realiza mediante Snyk; ambos artefactos cumplen funciones complementarias.

## 9. Entregables de la consigna

| Requisito | Archivo o evidencia |
|---|---|
| Pipeline CI/CD | `.github/workflows/ci.yml` |
| Infraestructura como código | `main.tf`, `outputs.tf` |
| Contenedorización | `Dockerfile` |
| Servicios de monitoreo | `compose.yaml`, `monitoring/` |
| Análisis de código | SonarQube Cloud |
| Análisis de dependencias | Snyk |
| Inventario de componentes | `security/sbom.cyclonedx.json` |
| Evidencia de monitoreo | `docs/evidencias/grafana-dashboard.png` |
| Documentación | `README.md` |

## 10. Consideraciones

- SonarQube Cloud y Snyk requieren sus secretos configurados en GitHub Actions.
- El despliegue local requiere que la VM esté encendida y el runner conectado.
- Terraform utiliza el socket local de Docker.
- Las tareas de la aplicación no persisten tras un reinicio.
- La entrega comprimida debe incluir el código, las configuraciones, el SBOM, la documentación y las evidencias, pero excluir credenciales, estados de Terraform y directorios temporales.
