# Build stage
FROM oven/bun:alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# Compile the application into a single executable with bytecode, target linux arm64, no sourcemaps, and minified
RUN bun build --compile src/index.ts --outfile /app/api-task --target=bun-linux-x64 --sourcemap=none --minify

# Final stage
FROM alpine:latest
ARG VERSION="next"
WORKDIR /app

# Install C++ libraries needed by the Bun executable
RUN apk add --no-cache libstdc++ libgcc

# Copy the compiled executable from the builder stage
COPY --from=builder /app/api-task /app/api-task

# Expose the port the application listens on
ENV PORT=8080
ENV VERSION=$VERSION
EXPOSE 8080

# Run the compiled executable
CMD ["/app/api-task"]
