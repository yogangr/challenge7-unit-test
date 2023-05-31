const ApplicationController = require("../ApplicationController");
const { NotFoundError } = require("../../errors");

describe("ApplicationController", () => {
  describe("handleGetRoot", () => {
    it("should return a 200 status code", () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const applicationController = new ApplicationController();
      applicationController.handleGetRoot(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("handleNotFound", () => {
    it("should return a 404 status code", () => {
      const req = {
        method: "GET",
        url: "/notfound",
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const applicationController = new ApplicationController();
      const err = new NotFoundError(req.method, req.url);
      applicationController.handleNotFound(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          name: err.name,
          message: err.message,
          details: err.details,
        },
      });
    });
  });

  describe("handleError", () => {
    it("should return a 500 status code", () => {
      const err = {};
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const applicationController = new ApplicationController();
      applicationController.handleError(err, req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          name: err.name,
          message: err.message,
          details: err.details || null,
        },
      });
    });
  });

  describe("getOffsetFromRequest", () => {
    it("should return a number", () => {
      const req = { query: { page: 1, pageSize: 10 } };
      const applicationController = new ApplicationController();
      const offset = applicationController.getOffsetFromRequest(req);
      expect(offset).toBe(0);
    });
  });

  describe("buildPaginationObject", () => {
    it("should return an object", () => {
      const req = { query: { page: 1, pageSize: 10 } };
      const count = 10;
      const applicationController = new ApplicationController();
      const paginationObject = applicationController.buildPaginationObject(
        req,
        count
      );
      expect(paginationObject).toEqual({
        page: 1,
        pageCount: 1,
        pageSize: 10,
        count: 10,
      });
    });
  });
});
