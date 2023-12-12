const express = require('express');
const mainController = require('../controllers/main');
const { body } = require("express-validator")

const validationRegister = [
  body('name').notEmpty().withMessage('El nombre no puede ser vacio'),
  body('email')
      .notEmpty().withMessage('El email no puede ser vacio')
      .bail()
      .isEmail().withMessage('El email es invalido'),
  body('password').notEmpty().withMessage('La contraseña no puede ser vacio'),
  body('category').notEmpty().withMessage('Es necesario asignar una categoria'),
]

const validationLogin = [
  body('email')
    .notEmpty().withMessage('El email no puede ser vacio')
    .bail()
    .isEmail().withMessage('El email es invalido'),
]

const router = express.Router();

router.get('/', mainController.home);
router.get('/books/detail/:id', mainController.bookDetail);
router.get('/books/search', mainController.bookSearch);
router.post('/books/search', mainController.bookSearchResult);
router.get('/authors', mainController.authors);
router.get('/authors/:id/books', mainController.authorBooks);
router.get('/users/register', mainController.register);
router.post('/users/register', validationRegister, mainController.processRegister);
router.get('/users/login', mainController.login);
router.get('/users/logout', mainController.logout);
router.post('/users/login', validationLogin, mainController.processLogin);
router.post('/books/delete/:id', mainController.deleteBook);
router.get('/books/edit/:id', mainController.edit);
router.post('/books/edit/:id', mainController.processEdit);

module.exports = router;
