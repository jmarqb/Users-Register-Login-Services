## Table of Contents
1. [General Info](#general-info)
2. [Technologies](#technologies)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Running the Application](#running-the-application)
7. [Using Docker](#using-docker)
8. [Test](#test)
9. [API Documentation](#api-documentation)

### General Info
***
Users Register and Authentication API

This project is an API developed to manage user registration and authentication services.

### Technologies
***
A list of technologies used within the project:

* @nestjs/common (Version 10.0.0): Provides essential components for creating modules, controllers, services, and other basic elements in NestJS.
* @nestjs/config (Version 3.0.1): Manages application configuration based on .env files for NestJS.
* @nestjs/jwt (Version 10.1.1): Offers functionalities for JSON Web Tokens (JWT) based authentication in NestJS.
* @nestjs/passport (Version 10.0.1): Integrates the Passport package, an authentication middleware for Node.js, with NestJS.
* @nestjs/swagger (Version 7.1.11): Tool to generate OpenAPI (Swagger) based API documentation for NestJS applications.
* @nestjs/typeorm (Version 10.0.0): Integrates TypeORM with NestJS, facilitating the connection and operation with databases.
* TypeORM (Version 0.3.17): An ORM (Object-Relational Mapper) for TypeScript and JavaScript, allowing interaction with databases using objects.
* bcrypt (Version 5.1.1): A library used to hash passwords, ensuring security in password storage and verification.
* class-transformer (Version 0.5.1): Transforms plain objects into class instances and vice versa, useful for validating and transforming responses and requests.
* class-validator (Version 0.14.0): Validates classes and objects in TypeScript using decorators.
* dotenv (Version 16.3.1): Loads environment variables from a .env file into process.env in Node.js.
* passport-jwt (Version 4.0.1): A Passport strategy for authenticating with a JSON Web Token.
* pg (Version 8.11.3): Non-blocking PostgreSQL client for Node.js.
* uuid (Version 9.0.0): Generates universally unique identifiers, useful for creating unique IDs in databases and other resources.
* Jest (Version 29.5.0): A testing framework for JavaScript and TypeScript, used for writing and running unit and integration tests.
* Supertest (Version 6.3.3): A library for testing HTTP servers.
* TypeScript (Version 5.1.3): A superset of JavaScript that adds static typing and other object-oriented programming features.

### Prerequisites
***
Before you begin, ensure you have met the following requirements:
* You have installed node.js and npm.
* You have PostgreSQL running.
* Docker and Docker Compose installed(if you prefer to run the application with Docker or to run e2e tests with testcontainers)


## Installation

To install API, follow these steps:

Linux and macOS:
```bash
$ git clone https://github.com/jmarqb/Users-Register-Login-Services.git
$ cd Users-Register-Login-Services
$ npm install
```

Windows:
```bash
$ git clone https://github.com/jmarqb/Users-Register-Login-Services.git
$ cd Users-Register-Login-Services
$ npm install
```

## Configuration

Copy the contents of .env.example into a new .env file and update it with your PostgreSQL connection parameters.

Linux/Windows:
```
$ cp .env.example .env
> copy .env.example .env
```

In the .env file, set the NODE_ENV= environment variable to 'testing', 'production', or 'development'. This determines the application's launch mode, dictating which database connection credentials to use.

## Running the Application

To run Users Register and Authentication API, use the following command:

```bash
$ npm run build
$ npm run start
```

This will start the server and the application will be available at http://localhost:<your_port>

For example: `localhost:<port>/api/documentation`

Remember to replace <your_port> with the port number you've set in your .env file, ensure the NODE_ENV= environment variable is also set in the .env file, and make sure PostgreSQL is running as specified in the prerequisites.

* [Optional] If you need in the project exists a file `docker-development-locally.yaml` with a configuration a postgreSQL container for development locally in your computer, for run this container
execute the following command:

```bash
$ docker-compose -f docker-development-locally.yaml up -d
```

* Executed Seed (If you need a provide info to add the database) use the endpoint:
```
http://localhost:<your_port>/api/seed
```


## Using Docker

If you have Docker and Docker Compose installed, running the application becomes even easier. First, clone the repository and navigate to the project directory:

```bash
$ git clone https://github.com/jmarqb/Users-Register-Login-Services.git
$ cd Users-Register-Login-Services/.docker
```

To run the application with Docker, ensure that you've completed the .env configuration with the necessary parameters for the container environment. [View the configuration section](#configuration)

To start the application with Docker:

```bash
$ docker-compose up --build
```

This will build the necessary images, start the containers, and the application will be available at http://localhost:<your_port>.

To stop the application:

```bash
$ docker-compose down
```

* [Optional] If you need in the project exists a file `docker-development-locally.yaml` with a configuration a postgreSQL container for development locally in your computer, for run this container
execute the following command:

```bash
$ docker-compose -f docker-development-locally.yaml up
```

## Test

To ensure everything runs smoothly, this project includes both Unit and Integration tests using the tools Jest and Supertest. To execute them, follow these steps:

Dependency Installation: Before running the tests, ensure you've installed all the project dependencies. If you haven't done so yet, you can install them by executing the command `npm install`.

Unit Tests: To run unit tests on controllers and services, use the following command:

```bash
$ npm run test:watch
```

Integration Tests (e2e): These tests verify the complete flow and functioning of the application. To run them, use the command:

```bash
$ npm run test:e2e
```

It's important to highlight that these e2e tests utilize a Docker testcontainer with a PostgreSQL database. This database is specifically created to test all the application's endpoints and the related database operations. Once the tests are completed, the database is automatically removed.

## API Documentation

You can access the API documentation at `localhost:<port>/api/documentation` 
For example, when running the server locally, it will be available at localhost:3000/api/documentation

For more detailed information about the endpoints, responses, and status codes, visit the API documentation.