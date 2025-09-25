FROM alpine:latest

WORKDIR /app
COPY . /app

RUN apk add go
RUN apk add gcc

RUN go build .

CMD ["./mbta"]