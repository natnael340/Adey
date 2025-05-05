provider "aws" {
  region = "us-east-2"
  profile = "personal"
}

resource "aws_vpc" "main_vpc" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "main-vpc"
  }
}

resource "aws_subnet" "public_subnet_a" {
  vpc_id            = aws_vpc.main_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-2a"
  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet-a"
  }
  
}

resource "aws_subnet" "public_subnet_b" {
  vpc_id            = aws_vpc.main_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-east-2b"
  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet-b"
  }
  
}

resource "aws_internet_gateway" "igw" {
    vpc_id = aws_vpc.main_vpc.id
    
    tags = {
        Name = "main-igw"
    }
}

resource "aws_route_table" "public_route_table" {
    vpc_id = aws_vpc.main_vpc.id

    route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.igw.id
    }

    tags = {
        Name = "public-route-table"
    }
}

resource "aws_route_table_association" "public_association_a" {
    subnet_id      = aws_subnet.public_subnet_a.id
    route_table_id = aws_route_table.public_route_table.id
}

resource "aws_route_table_association" "public_association_b" {
    subnet_id      = aws_subnet.public_subnet_b.id
    route_table_id = aws_route_table.public_route_table.id
}

resource "aws_security_group" "web_sg" {
    name        = "web-sg"
    description = "Allow HTTP and SSH traffic"
    vpc_id = aws_vpc.main_vpc.id

    ingress {
        description = "Allow HTTP traffic"
        from_port   = 80
        to_port     = 80
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    # ingress {
    #     description = "Allow HTTPS traffic"
    #     from_port   = 443
    #     to_port     = 443
    #     protocol    = "tcp"
    #     cidr_blocks = ["0.0.0.0/0"]
    # }

    egress {
        description = "Allow all outbound traffic"
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }
    
    tags = {
        Name = "web-sg"
    }
}

resource "aws_security_group" "ecs_task_sg" {
  name = "esc-task-sg"
  description = "Allow traffic from ALB only"
  vpc_id = aws_vpc.main_vpc.id

  ingress {
    description = "Allow traffic from ALB"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    security_groups = [aws_security_group.web_sg.id]
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
    security_groups    = [aws_security_group.web_sg.id]
    subnets            = [aws_subnet.public_subnet_a.id, aws_subnet.public_subnet_b.id]

    tags = {
        Name = "main-alb"
    }   
  
}

resource "aws_lb_target_group" "app_tg" {
    name = "app-tg"
    port = 80
    protocol = "HTTP"
    vpc_id = aws_vpc.main_vpc.id
    target_type = "ip"

    health_check {
        path                = "/"
        protocol           = "HTTP" 
        matcher            = "200-399"
        interval            = 30
        timeout             = 5
        healthy_threshold  = 2
        unhealthy_threshold = 2
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

resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecsTaskExecutionRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_attach" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_ecs_task_definition" "app_task" {
  family                   = "app-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"     # 0.5 vCPU
  memory                   = "1024"    # 1 GB RAM
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "app-container"
      image     = "nginx:latest"    # Public image for testing
      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
          protocol      = "tcp"
        }
      ]
    }
  ])
}


resource "aws_ecs_service" "app_service" {
  name            = "app-service"
  cluster         = aws_ecs_cluster.app_cluster.id
  task_definition = aws_ecs_task_definition.app_task.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
    subnets          = [aws_subnet.public_subnet_a.id, aws_subnet.public_subnet_b.id]
    security_groups  = [aws_security_group.ecs_task_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app_tg.arn
    container_name   = "app-container"
    container_port   = 80
  }

  depends_on = [
    aws_lb_listener.http_listener
  ]
}
