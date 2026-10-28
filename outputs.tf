output "taskflow_url" {
  description = "URL local de TaskFlow administrado por Terraform"
  value       = "http://localhost:5001"
}

output "container_name" {
  description = "Nombre del contenedor administrado por Terraform"
  value       = docker_container.taskflow.name
}
