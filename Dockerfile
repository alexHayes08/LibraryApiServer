FROM node:8

# Create app directory
WORKDIR /usr/src/LibraryApiServer

# Install app dependencies
# A wildcard is used to ensure both package.json and package-lock.json are
# copied where available (npm@5+)
COPY package*.json ./

RUN npm install
RUN npm run build-ts

# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]
