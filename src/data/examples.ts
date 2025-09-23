import type { ExampleContent } from '../types';

// Predefined examples for all supported formats
export const examples: ExampleContent[] = [
  {
    name: 'Docker Compose',
    icon: '🐳',
    format: 'docker-compose',
    description:
      'Multi-container application with web server, API, and database',
    content: `version: '3.8'

services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    depends_on:
      - api
    networks:
      - frontend

  api:
    image: node:16-alpine
    ports:
      - "3000:3000"
    depends_on:
      - database
    environment:
      - DATABASE_URL=postgresql://user:password@database:5432/myapp
    networks:
      - frontend
      - backend

  database:
    image: postgres:13
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - db_data:/var/lib/postgresql/data
    networks:
      - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge

volumes:
  db_data:`,
  },
  {
    name: 'Kubernetes Deployment',
    icon: '☸️',
    format: 'kubernetes',
    description: 'Web application deployment with service and ingress',
    content: `---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web
        image: nginx:1.20
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: web-service
  namespace: production
spec:
  selector:
    app: web-app
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP`,
  },
  {
    name: 'Terraform AWS',
    icon: '🏗️',
    format: 'terraform',
    description: 'AWS infrastructure with VPC, EC2, and RDS',
    content: `terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "main-vpc"
  }
}

resource "aws_instance" "web" {
  ami           = "ami-0c02fb55956c7d316"
  instance_type = "t3.micro"
  
  tags = {
    Name = "web-server"
  }
}`,
  },
  {
    name: 'CloudFormation',
    icon: '☁️',
    format: 'cloudformation',
    description: 'AWS resources with CloudFormation template',
    content: `AWSTemplateFormatVersion: '2010-09-09'
Description: 'Simple web application infrastructure'

Parameters:
  InstanceType:
    Type: String
    Default: t3.micro
    Description: EC2 instance type

Resources:
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: MyVPC

  WebServer:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: ami-0c02fb55956c7d316
      InstanceType: !Ref InstanceType
      Tags:
        - Key: Name
          Value: WebServer`,
  },
];
