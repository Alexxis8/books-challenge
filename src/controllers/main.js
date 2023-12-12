const bcryptjs = require('bcryptjs');
const db = require('../database/models');
const {validationResult} = require("express-validator");

const mainController = {
  home: (req, res) => {
    db.Book.findAll({
      include: [{ association: 'authors' }]
    })
      .then((books) => {
      return  res.render('home', { books });
      })
      .catch((error) => console.log(error));
  },
  bookDetail: async (req, res) => {
    // Implement look for details in the database 
    const { id } = req.params;

    const book = await db.Book.findByPk(id, {
      include: [{ association: "authors" }],
    });

    return res.render("bookDetail", { book })            
  },
  bookSearch: (req, res) => {
  return  res.render('search', { books: [] });
  },
  bookSearchResult: async (req, res) => {
    // Implement search by title
    const { title } = req.body;
    console.log(title);
    const books = await db.Book.findAll({
      include: [{ association: "authors" }],
      where: {
        title: {
          [db.Sequelize.Op.like]: `%${title}%`,
        },
      },
    });

    return res.render("search", { books })
  },
  deleteBook: async (req, res) => {
    // Implement delete book
    const {id} = req.params;

    try {
      const bookToDelete = await db.Book.findByPk(id, { include: [{association:"authors"}] });
  
      if (!bookToDelete) {
        return res.status(404).json({ error: 'Libro no encontrado' });
      }
      await bookToDelete.setAuthors([]);
      await bookToDelete.destroy();
  
      return res.redirect("/");
    } catch (error) {
      return res.status(500).json({ error: 'Error al eliminar el libro', details: error.message });
    }

  },
  authors: (req, res) => {
    db.Author.findAll()
      .then((authors) => {
      return  res.render('authors', { authors });
      })
      .catch((error) => console.log(error));
  },
  authorBooks: async (req, res) => {
    // Implement books by author
    const { id } = req.params;
    const books = await db.Book.findAll({
      include: [{ association: "authors" }],
      where: {
        "$authors.id$": id,
      },
    });
    return res.render("authorBooks", { books })
  },
  register: (req, res) => {
   return res.render("register", {message: null});
  },
  processRegister: async (req, res) => {
    const results = validationResult(req)

    if (!results.isEmpty()) {
      return res.render("register", { message: results.array()[0].msg });
    }

    const { name, email, country, password, category } = req.body;

    const userExists = await db.User.findOne({
      where: {
        email,
      },
    });

    if (userExists) {
      return res.render("register", { message: "El correo ya se encuentra registrado." });
    }

    if (!validateEmail(email)) {
      return res.render("register", { message: "El correo es incorrecto" });
    }

    await db.User.create({
      Name: name,
      Email: email,
      Country: country,
      Pass: bcryptjs.hashSync(password, 10),
      CategoryId: category,
    })

    res.redirect("/");
  },
  login: async (req, res) => {
    // Implement login process
    const { usuario } = req.cookies;

    if (usuario) {
      return res.redirect("login");
    }

    return res.render("login", { message: null })
  },
  processLogin: async (req, res) => {
    // Implement login process
    const results = validationResult(req)

    if (!results.isEmpty()) {
      return res.render("login", { message: results.array()[0].msg });
    }

    const { email, password } = req.body;

    const { dataValues } = await db.User.findOne({
      where: {
        email,
      },
    });

    const { Pass, ...user } = dataValues;

    if (!user) {
      return res.render("login", {
        message: "El correo o contraseña son incorrectos.",
      });
    }

    const passwordValid = bcryptjs.compareSync(password, Pass);

    if (!passwordValid) {
      return res.render("login", {
        message: "El correo o contraseña son incorrectos.",
      });
    }

    req.session.usuario = user;
    req.session.save(() => {
      res.cookie("usuario", user, { maxAge: 1000 * 60 * 60 * 24 });

      return res.redirect("/");
    });
  },
  logout: (req , res) =>{
    req.session.destroy();
    res.cookie("usuario", null, { maxAge: -1 });
    return res.redirect('/')
  },
  edit: async (req, res) => {
    // Implement edit book
    const {id} = req.params;
    const book = await db.Book.findByPk(id);

    return res.render("editBook", { id: req.params.id, book });
  },
  processEdit: async (req, res) => {
    // Implement edit book
    const { title, cover, description } = req.body;

    if(title && cover && description) {
      await db.Book.update({title, cover, description}, {where:{id: req.params.id}})
      return res.redirect('/');
    }
    
    return res.redirect("/")
  }
};

module.exports = mainController;
