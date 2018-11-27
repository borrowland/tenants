FROM node:8-alpine
RUN mkdir /tenants
WORKDIR /tenants
COPY . /tenants
CMD npm run prod
EXPOSE 8080