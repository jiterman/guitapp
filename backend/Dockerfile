# Build stage
FROM amazoncorretto:21 AS build
WORKDIR /home/app

# 1. Copy only the files needed to download dependencies
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# 2. Grant permissions and download dependencies (cached layer)
RUN chmod +x gradlew && ./gradlew build -x test --no-daemon || return 0

# 3. Copy the rest of the source and build the app
COPY . .
RUN ./gradlew build -x test --no-daemon

# Run stage
FROM amazoncorretto:21-alpine
WORKDIR /app
COPY --from=build /home/app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
