FROM python:3.10.12

ENV PYTHONDONTWRITEBYTECODE=1

ENV PYTHONUNBUFFERED 1


#install and use pipenv
COPY requirements.txt ./
RUN python -m pip install --upgrade pip
RUN pip install -r requirements.txt

WORKDIR /usr/src/app
COPY . /usr/src/app
