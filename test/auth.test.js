const request = require("supertest");
const app = require("../app");
const { User } = require("../app/models");

afterAll(async () => {
  await User.destroy({
    where: {
      email: "yogadwi@gmail.com",
    },
  });
});

describe("/POST /v1/auth/login", () => {
  it("should return 200 OK", async () => {
    return request(app)
      .post("/v1/auth/login")
      .send({
        email: "fikri@binar.co.id",
        password: "123456",
      })
      .then((res) => {
        expect(res.status).toBe(201);
        expect(res.body.accessToken).toBeDefined();
      });
  });
  it("should return 404 Not Found if the user is not found", async () => {
    return request(app)
      .post("/v1/auth/login")
      .send({
        email: "yoga0@gmail.com",
        password: "passwordsalah",
      })
      .then((res) => {
        expect(res.status).toBe(404);
        expect(res.body.error).toBeDefined();
      });
  });
  it("should return 401 Wrong Password if the password is wrong", async () => {
    return request(app)
      .post("/v1/auth/login")
      .send({
        email: "fikri@binar.co.id",
        password: "123456789",
      })
      .then((res) => {
        expect(res.status).toBe(401);
        expect(res.body).toBeDefined();
      });
  });
});

describe("/POST /v1/auth/register", () => {
  it("should return 422 if the email is already registered", async () => {
    return request(app)
      .post("/v1/auth/register")
      .set("Content-Type", "application/json")
      .send({
        name: "Fikri",
        email: "fikri@binar.co.id",
        password: "123456",
      })
      .then((res) => {
        expect(res.status).toBe(500);
        expect(res.body.error).toBeDefined();
      });
  });
  it("should return 201 if the user is successfully registered", async () => {
    return request(app)
      .post("/v1/auth/register")
      .set("Content-Type", "application/json")
      .send({
        name: "Yoga Dwi",
        email: "yogadwi@gmail.com",
        password: "123456",
      })
      .then((res) => {
        expect(res.status).toBe(201);
        expect(res.body.accessToken).toBeDefined();
      });
  });
});
