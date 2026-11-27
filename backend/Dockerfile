FROM node:24-slim
WORKDIR /app
COPY --chmod=0644 server.mjs contracts.mjs ./
USER node
ENV PORT=8080
EXPOSE 8080
CMD ["node","server.mjs"]
