FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o trail-tui .

FROM alpine:3.20
COPY --from=builder /app/trail-tui /usr/local/bin/trail-tui
ENTRYPOINT ["trail-tui"]
