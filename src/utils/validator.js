const Joi = require('joi');

class Validator {
  static sanitizeInput(input) {
    if (typeof input === 'string') {
      return input.trim().replace(/[<>"'&