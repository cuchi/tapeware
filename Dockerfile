FROM node:12

COPY package.json index.js ./

CMD ["node", "index.js"]
