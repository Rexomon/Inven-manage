# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base

RUN apt-get update && apt-get install -y curl

# Create a non-root user and group
RUN addgroup --system appgroup && adduser --system appuser --ingroup appgroup

WORKDIR /usr/src/app

COPY package.json bun.lockb ./
RUN bun install

COPY . .

RUN bun run build
ENV NODE_ENV=production

# Change ownership of the application directory
RUN chown -R appuser:appgroup /usr/src/app

# Switch to the non-root user
USER appuser

# Health check using curl to check the main endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
CMD curl -f http://localhost:3000/ || exit 1

CMD [ "bun", "run", "start" ]
