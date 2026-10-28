terraform {
  required_version = ">= 1.5.0"

  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {
  host = "unix:///var/run/docker.sock"
}

resource "docker_image" "taskflow" {
  name         = "taskflow-terraform:latest"
  keep_locally = true

  build {
    context    = path.module
    dockerfile = "Dockerfile"
  }
}

resource "docker_container" "taskflow" {
  name    = "taskflow-terraform"
  image   = docker_image.taskflow.image_id
  restart = "unless-stopped"

  ports {
    internal = 5000
    external = 5001
  }
}
