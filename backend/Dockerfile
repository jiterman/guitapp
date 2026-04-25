# Build stage
FROM amazoncorretto:21 AS build
WORKDIR /home/app

COPY . .

RUN chmod +x gradlew && ./gradlew build -x test --no-daemon

# Run stage
FROM amazoncorretto:21-alpine
WORKDIR /app
COPY --from=build /home/app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
