FROM node:24-slim
WORKDIR /app
COPY server.mjs contracts.mjs ./
USER node
ENV PORT=8080
EXPOSE 8080
CMD ["node","server.mjs"]
