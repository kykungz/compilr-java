FROM openjdk:latest

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json package-lock.json config.js compilr.js server.js ./
COPY dist ./dist/

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
RUN npm install

EXPOSE 8080

CMD [ "npm", "start" ]
