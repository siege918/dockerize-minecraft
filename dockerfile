FROM openjdk:8u222
RUN apt-get install -y curl \
  && curl -sL https://deb.nodesource.com/setup_10.x | bash - \
  && apt-get install -y nodejs \
  && curl -L https://www.npmjs.com/install.sh | sh

RUN apt-get install git -y

WORKDIR /buildtools
RUN wget https://hub.spigotmc.org/jenkins/job/BuildTools/lastSuccessfulBuild/artifact/target/BuildTools.jar
RUN git config --global --unset core.autocrlf
RUN java -jar BuildTools.jar

WORKDIR /server
RUN mv /buildtools/spigot*.jar spigot.jar
