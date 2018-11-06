FROM node:8
RUN mkdir /tenants
WORKDIR /tenants
COPY . /tenants
CMD npm run prod
EXPOSE 8080