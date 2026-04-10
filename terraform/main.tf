provider "aws" {
  region = "ap-south-1"
}

resource "aws_instance" "devops_server" {
  ami           = "ami-0c55b159cbfafe1f0"  # Ubuntu AMI (example)
  instance_type = "t2.micro"

  tags = {
    Name = "BusBooking-DevOps-Server"
  }
}

output "server_ip" {
  value = aws_instance.devops_server.public_ip
}