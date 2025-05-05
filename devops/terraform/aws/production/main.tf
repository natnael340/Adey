provider "aws" {
  region = "us-east-2"
}

resource "aws_vpc" "adey_vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "main-vpc"
  }
}

resource "aws_subnet" "adey_subnet_a" {
  vpc_id            = aws_vpc.adey_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-2a"
  map_public_ip_on_launch = true

  tags = {
    Name = "adey-subnet-a"
  }
  
}

resource "aws_subnet" "adey_subnet_b" {
  vpc_id            = aws_vpc.adey_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-east-2b"
  map_public_ip_on_launch = true

  tags = {
    Name = "adey-subnet-b"
  }
  
}

resource "aws_internet_gateway" "igw" {
    vpc_id = aws_vpc.adey_vpc.id
    
    tags = {
        Name = "adey-igw"
    }
}

resource "aws_route_table" "adey_route_table" {
    vpc_id = aws_vpc.adey_vpc.id

    route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.igw.id
    }

    tags = {
        Name = "public-route-table"
    }
}

resource "aws_route_table_association" "adey_association_a" {
    subnet_id      = aws_subnet.adey_subnet_a.id
    route_table_id = aws_route_table.adey_route_table.id
}

resource "aws_route_table_association" "adey_association_b" {
    subnet_id      = aws_subnet.adey_subnet_b.id
    route_table_id = aws_route_table.adey_route_table.id
}

resource "aws_security_group" "adey_sg" {
    name        = "adey-sg"
    description = "Allow HTTP and SSH traffic"
    vpc_id = aws_vpc.adey_vpc.id

    ingress {
        description = "Allow HTTP traffic"
        from_port   = 80
        to_port     = 80
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    # ingress {
    #      description = "Allow HTTPS traffic"
    #      from_port   = 443
    #      to_port     = 443
    #      protocol    = "tcp"
    #      cidr_blocks = ["0.0.0.0/0"]
    # }

    egress {
        description = "Allow all outbound traffic"
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }
    
    tags = {
        Name = "adey-sg"
    }
}

resource "aws_security_group" "ecs_task_sg" {
  name = "esc-task-sg"
  description = "Allow traffic from ALB only"
  vpc_id = aws_vpc.adey_vpc.id

  ingress {
    description = "Allow traffic from ALB"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    security_groups = [aws_security_group.adey_sg.id]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "ecs-task-sg"
  }
}

resource "aws_lb" "main_alb" {
    name               = "main-alb"
    internal           = false
    load_balancer_type = "application"
    security_groups    = [aws_security_group.adey_sg.id]
    subnets            = [aws_subnet.adey_subnet_a.id, aws_subnet.adey_subnet_b.id]

    tags = {
        Name = "main-alb"
    }   
  
}

resource "aws_lb_target_group" "app_tg" {
    name = "app-tg"
    port = 8000
    protocol = "HTTP"
    vpc_id = aws_vpc.adey_vpc.id
    target_type = "ip"

    health_check {
        path                = "/health"
        protocol           = "HTTP" 
        matcher            = "200-399"
        interval            = 60
        timeout             = 30
        healthy_threshold  = 3
        unhealthy_threshold = 5
    }

    tags = {
      Name = "app-tg"
    }
  
}


resource "aws_lb_listener" "http_listener" {
    load_balancer_arn = aws_lb.main_alb.arn
    port              = 80
    protocol          = "HTTP"

    default_action {
        type = "forward"
        target_group_arn = aws_lb_target_group.app_tg.arn
    }  
}


resource "aws_ecs_cluster" "app_cluster" {
  name = "app-cluster"
}

data "aws_iam_role" "ecs_task_execution_role" {
  name = "ecsTaskExecutionRole"
}

resource "aws_iam_role_policy_attachment" "ecs_execution_attach" {
  role       = data.aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_policy" "ecs_s3_access_policy" {
  name = "ecs-s3-access-policy"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "s3:GetObject"
        ],
        Resource = "arn:aws:s3:::adey-chatbot/env/.production.env"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_s3_attach" {
  role       = data.aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.ecs_s3_access_policy.arn
}

resource "aws_efs_file_system" "adey_efs" {
  creation_token = "adey-efs"
}

resource "aws_security_group" "efs_sg" {
  name        = "efs-sg"
  description = "Allow NFS traffic to EFS"
  vpc_id      = aws_vpc.adey_vpc.id

  ingress {
    from_port       = 2049
    to_port         = 2049
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_task_sg.id] # Allow ECS tasks
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_efs_mount_target" "subnet_a" {
  file_system_id  = aws_efs_file_system.adey_efs.id
  subnet_id       = aws_subnet.adey_subnet_a.id
  security_groups = [aws_security_group.efs_sg.id]
}

resource "aws_efs_mount_target" "subnet_b" {
  file_system_id  = aws_efs_file_system.adey_efs.id
  subnet_id       = aws_subnet.adey_subnet_b.id
  security_groups = [aws_security_group.efs_sg.id]
}

resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/adey-app"
  retention_in_days = 7
}

resource "aws_security_group_rule" "allow_alb_to_ecs" {
  type              = "ingress"
  from_port         = 8000
  to_port           = 8000
  protocol          = "tcp"
  security_group_id = aws_security_group.ecs_task_sg.id
  source_security_group_id = aws_security_group.adey_sg.id
}

resource "aws_ecs_task_definition" "adey_task" {
  family                   = "adey-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"     # 0.5 vCPU
  memory                   = "1024"    # 1 GB RAM
  task_role_arn = data.aws_iam_role.ecs_task_execution_role.arn
  execution_role_arn       = data.aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "rabbitmq-container",
      image = "rabbitmq:3-management",
      portMappings = [
        {
          containerPort = 5672,
          hostPort      = 5672,
          protocol      = "tcp"
        }
      ],
      environmentFiles = [
        {
          type = "s3",
          value = "arn:aws:s3:::adey-chatbot/env/.production.env"
        }
      ],
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name,
          "awslogs-region"       = "us-east-2",
          "awslogs-stream-prefix" = "ecs"
        }
      }
    },
    {
      name = "adey-db"
      image = "m4lik147/adey-db",
      portMappings = [
        {
          containerPort = 5432,
          hostPort      = 5432,
          protocol      = "tcp"
        }
      ],
      mountPoints = [
        {
          sourceVolume  = "pgdata",
          containerPath = "/var/lib/postgresql/data"
        }
      ],
      healthCheck = {
        command     = ["CMD-SHELL", "pg_isready -U adey_backend"],
        interval    = 30,
        timeout     = 5,
        retries     = 3,
        startPeriod = 10
      },
      environmentFiles = [
        {
          type = "s3",
          value = "arn:aws:s3:::adey-chatbot/env/.production.env"
        }
      ],
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name,
          "awslogs-region"       = "us-east-2",
          "awslogs-stream-prefix" = "ecs"
        }
      }
    },
    {
      name = "adey-backend",
      image = "m4lik147/adey-backend",
      portMappings = [
        {
          containerPort = 8000,
          hostPort      = 8000,
          protocol      = "tcp"
        }
      ],
      environmentFiles = [
          {
            type = "s3",
            value = "arn:aws:s3:::adey-chatbot/env/.production.env"
          }
        ],
        command = [
          "sh",
          "-c",
          "python manage.py migrate && celery -A adey worker --loglevel=info & python manage.py runserver 0.0.0.0:8000"
        ],
        dependsOn = [
          {
            containerName = "adey-db",
            condition     = "HEALTHY"
          }
        ],
        logConfiguration = {
          logDriver = "awslogs",
          options = {
            "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name,
            "awslogs-region"       = "us-east-2",
            "awslogs-stream-prefix" = "ecs"
          }
        }
      }
    ])
    volume {
      name = "pgdata"
      efs_volume_configuration {
        file_system_id = aws_efs_file_system.adey_efs.id
        root_directory = "/"
        transit_encryption = "ENABLED"
      }
    }
  }


  resource "aws_ecs_service" "app_service" {
    name            = "app-service"
    cluster         = aws_ecs_cluster.app_cluster.id
    task_definition = aws_ecs_task_definition.adey_task.arn
    launch_type     = "FARGATE"
    desired_count   = 1
    enable_execute_command = true

    network_configuration {
      subnets          = [aws_subnet.adey_subnet_a.id, aws_subnet.adey_subnet_b.id]
      security_groups  = [aws_security_group.ecs_task_sg.id]
      assign_public_ip = true
    }

    load_balancer {
      target_group_arn = aws_lb_target_group.app_tg.arn
      container_name   = "adey-backend"
      container_port   = 8000
    }

    depends_on = [
      aws_lb_listener.http_listener
    ]
  }
