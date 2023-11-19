# Build Stage
FROM golang:1.21.3-alpine3.18 AS builder
WORKDIR /app

COPY . .

RUN go build -o lifestyle main.go


# Run stage
FROM alpine:3.18 AS runtime
WORKDIR /app

COPY --from=builder /app/lifestyle /app
COPY --from=builder /app/db /app
COPY .env /app

EXPOSE 1300
CMD [ "./lifestyle" ]