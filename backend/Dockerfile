FROM golang:1.25.1-alpine

WORKDIR /app
COPY . /app

RUN go build .

CMD ["./mbta"]