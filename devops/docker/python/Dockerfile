FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1

ENV PYTHONUNBUFFERED 1

RUN apt-get update -y && apt-get upgrade -y
RUN apt-get install gcc libpq-dev -y
RUN apt-get install libmagic1 -y

COPY requirements.txt ./
RUN python -m pip install --upgrade pip
RUN pip install -r requirements.txt

WORKDIR /usr/src/app
COPY . /usr/src/app
