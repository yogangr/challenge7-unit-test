const CarController = require("../CarController");
const { Car, UserCar } = require("../../models");
const { CarAlreadyRentedError } = require("../../errors");
const dayjs = require("dayjs");
const { Op } = require("sequelize");

describe("CarController", () => {
  describe("instantiate CarController", () => {
    it("should instantiate CarController", () => {
      const mockCar = new Car({
        id: 1,
        name: "test",
        price: 100,
        size: "small",
        image: "test.jpg",
        isCurrentlyRented: false,
      });
      const mockUserCar = new UserCar({
        userId: 1,
        carId: 1,
        rentStartedAt: new Date(),
        rentEndedAt: new Date(),
      });

      const carController = new CarController({
        carModel: mockCar,
        userCarModel: mockUserCar,
        dayjs,
      });

      expect(carController).toBeDefined();
      expect(carController).toHaveProperty("carModel", mockCar);
      expect(carController).toHaveProperty("userCarModel", mockUserCar);
      expect(carController).toHaveProperty("dayjs", dayjs);
    });
  });

  describe("handleListCars", () => {
    it("should return a list of cars", async () => {
      const req = {
        query: {
          size: "SMALL",
          availableAt: "2020-01-01",
        },
      };
      const cars = [];
      const name = "Avanza";
      const price = "100000";
      const size = "small";
      const image = "test.jpg";
      const isCurrentlyRented = false;

      for (let i = 0; i < 10; i++) {
        const car = new Car({ name, price, size, image, isCurrentlyRented });
        cars.push(car);
      }

      const mockCarModel = {
        findAll: jest.fn().mockReturnValue(cars),
        count: jest.fn().mockReturnValue(10),
      };
      const mockUserCar = new UserCar({
        userId: 1,
        carId: 1,
        rentStartedAt: new Date(),
        rentEndedAt: new Date(),
      });

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: mockUserCar,
        dayjs,
      });

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await carController.handleListCars(req, res);

      expect(mockCarModel.findAll).toHaveBeenCalled();
      expect(mockCarModel.count).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        cars,
        meta: {
          pagination: {
            page: 1,
            pageCount: 1,
            pageSize: 10,
            count: 10,
          },
        },
      });
    });
  });

  describe("handleGetCar", () => {
    it("should return a car", async () => {
      const mockCar = new Car({
        id: 1,
        name: "Avanza",
        price: "10000",
        size: "small",
        image: "test.jpg",
        isCurrentlyRented: false,
      });
      const mockCarModel = {
        findByPk: jest.fn().mockReturnValue(mockCar),
      };

      const mockUserCar = new UserCar({
        userId: 1,
        carId: 1,
        rentStartedAt: new Date(),
        rentEndedAt: new Date(),
      });

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: mockUserCar,
        dayjs,
      });

      const req = {
        params: {
          id: 1,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await carController.handleGetCar(req, res);

      expect(mockCarModel.findByPk).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCar);
    });
  });

  describe("handleCreateCar", () => {
    it("should return a 422 status if there's an error", async () => {
      const mockCarModel = {
        create: jest.fn(() => Promise.reject(err)),
      };
      const mockUserCar = new UserCar({
        userId: 1,
        carId: 1,
        rentStartedAt: new Date(),
        rentEndedAt: new Date(),
      });

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: mockUserCar,
        dayjs,
      });

      const req = {
        body: {
          name: "Avanza",
          price: "10000",
          size: "small",
          image: "test.jpg",
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await carController.handleCreateCar(req, res);

      expect(mockCarModel.create).toHaveBeenCalledWith({
        ...req.body,
        isCurrentlyRented: false,
      });
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          name: expect.any(String),
          message: expect.any(String),
        },
      });
    });

    it("should return a 201 status and a car if there's no error", async () => {
      const mockCar = new Car({
        id: 1,
        name: "Avanza",
        price: "10000",
        size: "small",
        image: "test.jpg",
        isCurrentlyRented: false,
      });
      const mockCarModel = {
        create: jest.fn().mockReturnValue(mockCar),
      };
      const mockUserCar = new UserCar({
        userId: 1,
        carId: 1,
        rentStartedAt: new Date(),
        rentEndedAt: new Date(),
      });

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: mockUserCar,
        dayjs,
      });

      const req = {
        body: {
          name: "Avanza",
          price: "10000",
          size: "small",
          image: "test.jpg",
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await carController.handleCreateCar(req, res);

      expect(mockCarModel.create).toHaveBeenCalledWith({
        ...req.body,
        isCurrentlyRented: false,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCar);
    });
  });

  describe("handleUpdateCar", () => {
    it("should return a 422 status if car is not found", async () => {
      const mockCarModel = {
        findByPk: jest.fn().mockReturnValue(null),
      };

      const mockUserCar = new UserCar({
        userId: 1,
        carId: 1,
        rentStartedAt: new Date(),
        rentEndedAt: new Date(),
      });

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: mockUserCar,
        dayjs,
      });

      const req = {
        body: {
          name: "Avanza",
          price: "10000",
          size: "small",
          image: "test.jpg",
          isCurrentlyRented: false,
        },
        params: {
          id: 1,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await carController.handleUpdateCar(req, res);

      expect(mockCarModel.findByPk).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          name: expect.any(String),
          message: expect.any(String),
        },
      });
    });

    it("should update a car and send updated car", async () => {
      const mockCar = new Car({
        id: 1,
        name: "Avanza",
        price: "10000",
        size: "small",
        image: "test.jpg",
        isCurrentlyRented: false,
      });
      const mockCarModel = {
        findByPk: jest.fn().mockReturnValue(mockCar),
      };

      const mockUserCar = new UserCar({
        userId: 1,
        carId: 1,
        rentStartedAt: new Date(),
        rentEndedAt: new Date(),
      });

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: mockUserCar,
        dayjs,
      });

      const req = {
        body: {
          name: "Ferrari",
          price: "100000",
          size: "small",
          image: "test.jpg",
        },
        params: {
          id: 1,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await carController.handleUpdateCar(req, res);

      expect(mockCarModel.findByPk).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCar);
    });
  });

  describe("handleDeleteCar", () => {
    it("should delete a car", async () => {
      const mockCar = new Car({
        id: 1,
        name: "Avanza",
        price: "10000",
        image: "test.jpg",
        isCurrentlyRented: false,
      });
      const mockCarModel = {
        destroy: jest.fn().mockReturnValue(),
      };

      const mockUserCar = new UserCar({
        userId: 1,
        carId: 1,
        rentStartedAt: new Date(),
        rentEndedAt: new Date(),
      });

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: mockUserCar,
        dayjs,
      });

      const req = {
        params: {
          id: 1,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis(),
      };

      await carController.handleDeleteCar(req, res);

      expect(mockCarModel.destroy).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });
  });

  describe("handleRentCar", () => {
    it("should rent a car", async () => {
      const mockCar = new Car({
        name: "Lambo",
        price: "10000000",
        size: "SMALL",
        image:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fid.wikipedia.org%2Fwiki%2FBajaj&psig=AOvVaw2YLBkKGo8Z-OCJze25x5hf&ust=1668538058650000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCPiQoOOqrvsCFQAAAAAdAAAAABAD",
        isCurrentlyRented: false,
        createdAt: "2022-11-1 09:44:35",
        updatedAt: "2022-11-1 11:00:00",
      });

      const mockUserCar = new UserCar({
        userId: 5,
        carId: 1,
        rentStartedAt: "2022-11-1 09:44:35",
        rentEndedAt: "2022-11-2 09:44:35",
      });

      const mockCarModel = {
        findByPk: jest.fn().mockReturnValue(mockCar),
      };

      const mockUserCarModel = {
        findOne: jest.fn().mockReturnValue(null),
        create: jest.fn().mockReturnValue({
          userId: mockUserCar.userId,
          carId: mockUserCar.carId,
          rentStartedAt: mockUserCar.rentStartedAt,
          rentEndedAt: mockUserCar.rentEndedAt,
        }),
      };

      const mockRequest = {
        body: {
          rentStartedAt: "2022-11-1 09:44:35",
          rentEndedAt: "2022-11-2 09:44:35",
        },
        params: {
          id: 1,
        },
        user: {
          id: 5,
        },
      };

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const mockNext = jest.fn();

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: mockUserCarModel,
      });

      await carController.handleRentCar(mockRequest, mockResponse, mockNext);

      expect(mockCarModel.findByPk).toHaveBeenCalledWith(mockRequest.params.id);
      expect(mockUserCarModel.findOne).toHaveBeenCalledWith({
        where: {
          carId: mockCar.id,
          rentStartedAt: {
            [Op.gte]: mockRequest.body.rentStartedAt,
          },
          rentEndedAt: {
            [Op.lte]: mockRequest.body.rentEndedAt,
          },
        },
      });
      expect(mockUserCarModel.create).toHaveBeenCalledWith({
        userId: mockRequest.user.id,
        carId: mockCar.id,
        rentStartedAt: mockRequest.body.rentStartedAt,
        rentEndedAt: mockRequest.body.rentEndedAt,
      });
    });
  });
});
