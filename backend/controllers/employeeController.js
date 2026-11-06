const mongoose = require("mongoose");
const Employee = require("../models/Employee");


const createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json({
      message: "Employee added successfully"
    });
  } catch (error) {
    res.status(400).json({
      message: "Could not add employee",
      error: error.message
    });
  }
};


const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();

    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({
      message: "Could not get employees"
    });
  }
};

const getEmployeeByName = async (req, res) => {
  try {
    
    const employee = await Employee.findOne({ name: req.params.name });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(400).json({
      message: "Invalid employee name"
    });
  }
};



const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(400).json({
      message: "Invalid employee ID"
    });
  }
};



const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.status(200).json({
      message: "Employee updated successfully",
      employee
    });
  } catch (error) {
    res.status(400).json({
      message: "Could not update employee",
      error: error.message
    });
  }
};


const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.status(200).json({
      message: "Employee deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      message: "Could not delete employee"
    });
  }
};



module.exports = {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeByName
};