const AuthenticationController = require("../AuthenticationController");
const { User, Role } = require("../../models");
const {
  WrongPasswordError,
  RecordNotFoundError,
  InsufficientAccessError,
  EmailNotRegisteredError,
} = require("../../errors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

describe("AuthenticationController", () => {
  describe("#constructorAuthenticationController", () => {
    it("should be defined", () => {
      const name = "Yoga";
      const email = "yoga@gmail.com";
      const image = "yoga.jpeg";
      const encryptedPassword = "encryptedPassword";
      const roleId = 1;
      const roleName = "ADMIN";
      const mockUser = new User({
        name,
        email,
        image,
        encryptedPassword,
        roleId,
      });
      const mockRole = new Role({ name: roleName });
      const authentication = new AuthenticationController({
        userModel: mockUser,
        roleModel: mockRole,
        bcrypt,
        jwt,
      });
      expect(authentication).toBeDefined();
      expect(authentication).toHaveProperty("userModel", mockUser);
      expect(authentication).toHaveProperty("roleModel", mockRole);
      expect(authentication).toHaveProperty("bcrypt", bcrypt);
      expect(authentication).toHaveProperty("jwt", jwt);
    });
  });

  describe("authorize", () => {
    it("should return a 401 error if the token is not provided", () => {
      const roleName = "ADMIN";
      const mockRole = new Role({ name: roleName });

      const mockUser = new User({
        id: 1,
        name: "Yoga",
        email: "yoga@gmail.com",
        image: "yoga.jpeg",
        encryptedPassword: "encryptedPassword",
        roleId: 1,
      });

      const authentication = new AuthenticationController({
        userModel: mockUser,
        roleModel: mockRole,
        bcrypt,
        jwt,
      });

      const req = {
        headers: {
          authorization: "",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();

      authentication.authorize(roleName)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          name: "JsonWebTokenError",
          message: "jwt must be provided",
          details: null,
        },
      });
    });

    it("should return 401 if the token role is not same with the required role", () => {
      const roleName = "CUSTOMER";
      const mockRole = new Role({ id: 1, name: roleName });

      const mockUser = new User({
        id: 1,
        name: "Yoga",
        email: "yoga@gmail.com",
        image: "yoga.jpeg",
        encryptedPassword: "encryptedPassword",
        roleId: 1,
      });

      const authentication = new AuthenticationController({
        userModel: mockUser,
        roleModel: mockRole,
        bcrypt,
        jwt,
      });

      const req = {
        headers: {
          authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IkpvaG5ueSIsImVtYWlsIjoiam9obm55QGJpbmFyLmNvLmlkIiwiaW1hZ2UiOm51bGwsInJvbGUiOnsiaWQiOjEsIm5hbWUiOiJDVVNUT01FUiJ9LCJpYXQiOjE2NTQ1OTI3Nzl9.A1QUdj7kUy6Rfarn4jpy3z0SU6PVS-vJM51rO0I_hIc",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();

      authentication.authorize("ADMIN")(req, res, next);

      const err = new InsufficientAccessError(roleName);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          name: err.name,
          message: err.message,
          details: err.details,
        },
      });
    });

    it("should return next if the token role is same with the required role", () => {
      const roleName = "CUSTOMER";
      const mockRole = new Role({ id: 1, name: roleName });

      const mockUser = new User({
        id: 1,
        name: "Yoga",
        email: "yoga@gmail.com",
        image: "yoga.jpeg",
        encryptedPassword: "encryptedPassword",
        roleId: 1,
      });

      const authentication = new AuthenticationController({
        userModel: mockUser,
        roleModel: mockRole,
        bcrypt,
        jwt,
      });

      const req = {
        headers: {
          authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IkpvaG5ueSIsImVtYWlsIjoiam9obm55QGJpbmFyLmNvLmlkIiwiaW1hZ2UiOm51bGwsInJvbGUiOnsiaWQiOjEsIm5hbWUiOiJDVVNUT01FUiJ9LCJpYXQiOjE2NTQ1OTI3Nzl9.A1QUdj7kUy6Rfarn4jpy3z0SU6PVS-vJM51rO0I_hIc",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();

      authentication.authorize(roleName)(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("handleLogin", () => {
    it("should return a 404 error if the user is not found", async () => {
      const roleName = "ADMIN";

      const mockUserModel = {
        findOne: jest.fn().mockReturnValue(null),
      };

      const mockRole = new Role({ id: 2, name: roleName });

      const req = {
        body: {
          email: "aji@gmail.com",
          password: "password",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();

      const authentication = new AuthenticationController({
        userModel: mockUserModel,
        roleModel: mockRole,
        bcrypt,
        jwt,
      });

      const err = new EmailNotRegisteredError(req.body.email);

      await authentication.handleLogin(req, res, next);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: req.body.email.toLowerCase() },
        include: [{ model: mockRole, attributes: ["id", "name"] }],
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(err);
    });

    it("should return a 401 error if the password is incorrect", async () => {
      const roleName = "ADMIN";

      const mockUserModel = {
        findOne: jest.fn().mockReturnValue({
          id: 1,
          name: "Yoga",
          email: "yoga@gmail.com",
          image: "yoga.jpeg",
          encryptedPassword: "encryptedPassword",
          roleId: 2,
        }),
      };
      const mockRole = new Role({ id: 2, name: roleName });

      const req = {
        body: {
          email: "yoga@gmail.com",
          password: "password",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();

      const authentication = new AuthenticationController({
        userModel: mockUserModel,
        roleModel: mockRole,
        bcrypt,
        jwt,
      });

      const err = new WrongPasswordError();

      await authentication.handleLogin(req, res, next);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: req.body.email.toLowerCase() },
        include: [{ model: mockRole, attributes: ["id", "name"] }],
      });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(err);
    });

    it("should return a 201 status and a token if the password is correct", async () => {
      const roleName = "ADMIN";

      const mockRole = new Role({ id: 2, name: roleName });
      const mockUser = new User({
        id: 1,
        name: "Yoga",
        email: "yoga@gmail.com",
        image: "yoga.jpeg",
        encryptedPassword:
          "$2a$10$HOHjm0YoQ7jx7/y2pKTB7.jEc/sadBxY1Ic47bdM.kLoJp3ixVM9O",
        roleId: 2,
      });

      const mockUserModel = {
        findOne: jest.fn().mockReturnValue({
          ...mockUser.dataValues,
          Role: mockRole,
        }),
      };

      const req = {
        body: {
          email: "yoga@gmail.com",
          password: "password",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();

      const authentication = new AuthenticationController({
        userModel: mockUserModel,
        roleModel: mockRole,
        bcrypt,
        jwt,
      });

      await authentication.handleLogin(req, res, next);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: req.body.email.toLowerCase() },
        include: [{ model: mockRole, attributes: ["id", "name"] }],
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        accessToken: expect.any(String),
      });
    });
  });

  describe("handleRegister", () => {
    it("should return 201 status and a token if it success", async () => {
      const mockUser = new User({
        id: 1,
        name: "Aji",
        email: "aji@gmail.com",
        image: "aji.jpeg",
        encryptedPassword:
          "$2a$10$HOHjm0YoQ7jx7/y2pKTB7.jEc/sadBxY1Ic47bdM.kLoJp3ixVM9O",
        roleId: 2,
      });

      const mockUserModel = {
        findOne: jest.fn().mockReturnValue(null),
        create: jest.fn().mockReturnValue(mockUser),
      };

      const roleName = "CUSTOMER";
      const mockRole = new Role({ id: 2, name: roleName });

      const mockRoleModel = {
        findOne: jest.fn().mockReturnValue(mockRole.name),
      };

      const req = {
        body: {
          name: "Aji",
          email: "aji@gmail.com",
          password: "password",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();

      const authentication = new AuthenticationController({
        userModel: mockUserModel,
        roleModel: mockRoleModel,
        bcrypt,
        jwt,
      });

      await authentication.handleRegister(req, res, next);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: req.body.email.toLowerCase() },
      });
      expect(mockRoleModel.findOne).toHaveBeenCalledWith({
        where: { name: mockRole.name },
      });
      expect(mockUserModel.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        accessToken: expect.any(String),
      });
    });
  });

  describe("handleGetUser", () => {
    it("should return 200 status and user", async () => {
      const mockRole = new Role({ id: 1, name: "CUSTOMER" });
      const mockUser = new User({
        id: 1,
        name: "Yoga",
        email: "yoga@gmail",
        image: "yoga.jpeg",
        encryptedPassword:
          "$2a$10$HOHjm0YoQ7jx7/y2pKTB7.jEc/sadBxY1Ic47bdM.kLoJp3ixVM9O",
        roleId: 1,
      });

      const mockUserModel = {
        ...mockUser.dataValues,
        findByPk: jest.fn().mockReturnValue(mockUser),
      };

      const mockRoleModel = {
        ...mockRole.dataValues,
        findByPk: jest.fn().mockReturnValue(mockRole),
      };

      const mockRequest = {
        user: {
          id: 1,
        },
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const mockNext = jest.fn();

      const authentication = new AuthenticationController({
        userModel: mockUserModel,
        roleModel: mockRoleModel,
        bcrypt,
        jwt,
      });

      await authentication.handleGetUser(mockRequest, mockResponse, mockNext);

      expect(mockUserModel.findByPk).toHaveBeenCalledWith(mockRequest.user.id);
      expect(mockRoleModel.findByPk).toHaveBeenCalledWith(mockUserModel.roleId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });
  });
});
