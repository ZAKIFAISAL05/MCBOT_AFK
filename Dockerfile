FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN echo "ISI PACKAGE.JSON:"
RUN cat package.json

RUN npm install

COPY . .

CMD ["npm", "start"]
