const express = require("express");

const protect = require("../middleware/authMiddleware");
const employeeController = require("../controllers/employeeController");

const router = express.Router();

router.use(protect);

router.post("/", employeeController.createEmployee);

router.get("/", employeeController.getEmployees);

router.get("/name/:name", employeeController.getEmployeeByName);

router.get("/:id", employeeController.getEmployee);

router.put("/:id", employeeController.updateEmployee);

router.delete("/:id", employeeController.deleteEmployee);

module.exports = router;