import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Concert Ticket API",
      version: "1.0.0",
      description: "API Documentation for Concert Ticket App",
    },
    servers: [
      {
        url: "http://localhost:5001/api",
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);