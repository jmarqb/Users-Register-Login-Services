FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev
RUN npm rebuild bcrypt --build-from-source

# Bundle app source
COPY . .

#Build folder dist 
RUN npm run build

EXPOSE 3000
CMD [ "node", "dist/main.js" ]