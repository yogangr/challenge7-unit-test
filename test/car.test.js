const request = require("supertest");
const app = require("../app");
const { Car } = require("../app/models");
const { Op } = require("sequelize");

beforeAll(async () => {
  await Car.create({
    name: "Hammer",
    price: 300000,
    size: "LARGE",
    image: "hammer.jpeg",
  });
});

afterAll(async () => {
  await Car.destroy({
    where: {
      [Op.or]: [{ name: "Buggati" }, { name: "Ferrari" }, { name: "Hammer" }],
    },
  });
  await Car.update(
    {
      name: "Mazda RX4",
      image: "https://source.unsplash.com/500x500",
      price: 300000,
    },
    {
      where: {
        name: "Buggati",
      },
    }
  );
});

describe("GET /v1/cars", () => {
  it("should return 200 OK", async () => {
    return request(app)
      .get("/v1/cars")
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.cars).toBeDefined();
      });
  });
});

describe("GET /v1/cars/:id", () => {
  it("should return 200 OK", async () => {
    return request(app)
      .get("/v1/cars/1")
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toBeDefined();
      });
  });
});

describe("POST /v1/cars", () => {
  it("should return 201 CREATED", async () => {
    return request(app)
      .post("/v1/cars")
      .set("Content-Type", "application/json")
      .set(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwibmFtZSI6IkFyaWYiLCJlbWFpbCI6ImFyaWZAZ21haWwuY29tIiwiaW1hZ2UiOm51bGwsInJvbGUiOnsiaWQiOjIsIm5hbWUiOiJBRE1JTiJ9LCJpYXQiOjE2NTQ4MTQ1OTV9.WIPLcZ7rHYNFl9sC-mXDhqZEuxIo5STy5rItNBHT8Oc"
      )
      .send({
        name: "Ferrari",
        price: "100000",
        size: "SMALL",
        image: "ferrari.jpeg",
      })
      .then((res) => {
        expect(res.status).toBe(201);
        expect(res.body).toBeDefined();
      });
  });
  it("should return 401 Unauthorized if the token invalid", async () => {
    return request(app)
      .post("/v1/cars")
      .set("Content-Type", "application/json")
      .set(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwibmFtZSI6IkJheXUiLCJlbWFpbCI6ImNvYmFAYmluYXIuY28uaWQiLCJpbWFnZSI6bnVsbCwicm9sZSI6eyJpZCI6MSwibmFtZSI6IkNVU1RPTUVSIn0sImlhdCI6MTY1NDU5NjczN30.En_xBvVjsvmkFfps9OBwNhWTr2BGJoPBKY4cYRJ7GRg"
      )
      .send({
        name: "Xenia",
        price: "100000",
        size: "SMALL",
        image: "xenia.jpeg",
      })
      .then((res) => {
        expect(res.status).toBe(401);
        expect(res.body.error).toBeDefined();
      });
  });
});
