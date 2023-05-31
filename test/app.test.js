const request = require("supertest");
const app = require("../app");

describe("GET /", () => {
  it("should return 200 OK", async () => {
    return request(app)
      .get("/")
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.status).toBe("OK");
        expect(res.body.message).toBe("BCR API is up and running!");
      });
  });
});

describe("GET /notfound", () => {
  it("should return 404 Not Found", async () => {
    return request(app)
      .get("/notfound")
      .then((res) => {
        expect(res.status).toBe(404);
        expect(res.body.error.name).toBe("Error");
        expect(res.body.error.message).toBe("Not found!");
      });
  });
});
