FROM openjdk:8-jre-alpine
RUN apk add curl git


WORKDIR /buildtools
RUN wget https://hub.spigotmc.org/jenkins/job/BuildTools/lastSuccessfulBuild/artifact/target/BuildTools.jar \
  && java -jar BuildTools.jar --rev 1.16.1

FROM openjdk:8-jre-alpine
WORKDIR /server
RUN apk add --update nodejs nodejs-npm git
COPY --from=0 /buildtools/spigot*.jar .
RUN mv spigot*.jar spigot.jar
EXPOSE 25565

COPY package.json package.json
RUN npm install

COPY . .
CMD node minecraft.js
