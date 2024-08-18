# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base

WORKDIR /usr/src/app

COPY package.json bun.lockb ./
RUN bun install

COPY . .

ENV NODE_ENV=production

CMD [ "bun", "run", "dev" ]
