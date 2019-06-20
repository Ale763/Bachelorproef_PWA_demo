FROM alpine:3.7

# Initialize
RUN mkdir -p /data/
WORKDIR /data/
COPY requirements.txt /data/

# Setup
RUN apk update && apk upgrade
RUN apk add --update python3 python3-dev libffi-dev tzdata build-base gettext uwsgi
RUN pip3 install --upgrade pip && pip3 install -r requirements.txt

# Clean
RUN apk del -r python3-dev

# Prepare
COPY . /data/
RUN mkdir -p Project/static/admin



