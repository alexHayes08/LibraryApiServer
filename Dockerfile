FROM node:8

# Create app directory
WORKDIR .

# Install app dependencies
# A wildcard is used to ensure both package.json and package-lock.json are
# copied where available (npm@5+)
COPY package*.json ./
COPY tsconfig.json ./

# If you are building your code for production
# RUN npm install --only=production
RUN npm install -g tsc typescript
RUN npm install

# Bundle app source
COPY . .

RUN npm run build-docker

EXPOSE 8080
CMD [ "npm", "start" ]
