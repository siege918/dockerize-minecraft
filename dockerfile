FROM openjdk:8u222
RUN apt-get install -y curl \
  && curl -sL https://deb.nodesource.com/setup_10.x | bash - \
  && apt-get install -y nodejs \
  && curl -L https://www.npmjs.com/install.sh | sh


WORKDIR /buildtools
RUN wget https://hub.spigotmc.org/jenkins/job/BuildTools/lastSuccessfulBuild/artifact/target/BuildTools.jar
RUN java -jar BuildTools.jar --rev 1.14.3

WORKDIR /server
RUN mv /buildtools/spigot*.jar spigot.jar
RUN rm -rf /buildtools



RUN npm install node-watch

EXPOSE 25565
COPY . .
# CMD java -jar spigot.jar