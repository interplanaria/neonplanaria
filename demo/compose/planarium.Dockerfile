FROM node:10

WORKDIR /usr/app

COPY package.json .
RUN npm install

COPY . .

EXPOSE 7070

CMD ["node", "planarium.js"]