FROM mongo:7

COPY init.js /docker-entrypoint-initdb.d/init.js

EXPOSE 27017

CMD ["mongod", "--bind_ip_all"]