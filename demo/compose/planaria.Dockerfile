FROM node:10

WORKDIR /usr/app

COPY package.json .
RUN npm install

COPY . .

CMD ["node", "planaria.js"]
