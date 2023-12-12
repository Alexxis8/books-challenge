const bcryptjs = require('bcryptjs');
const db = require('../database/models');
const { Sequelize } = require("../database/models");
const Op = Sequelize.Op;

const mainController = {
  home: (req, res) => {
    db.Book.findAll({
      include: [{ association: 'authors' }]
    })
      .then((books) => {
      return  res.render('home', { books , message: req.session.message });
      })
      .catch((error) => console.log(error));
  },
  bookDetail: (req, res) => {
    // Implement look for details in the database 
    const id = req.params.id;
    db.Book.findByPk(id, {
      include: [{ association: "authors" }],
    })
      .then((book) => {
      return  res.render('bookDetail', {book , message: req.session.message});
      })
      .catch((error) => console.log(error));             
  },
  bookSearch: (req, res) => {
  return  res.render('search', { books: [], message: req.session.message });
  },
  bookSearchResult: (req, res) => {
    // Implement search by title
    const title = req.body.title;
    console.log(title);
    if (title.length == 0) {
    return  res.render("search", { books: [], message: req.session.message});
    }
    db.Book.findAll({
      include: [{ association: "authors" }],
      where: {
        title: {
          [Op.like]: `%${title}%`,
        },
      },
    })
      .then((books) => {
      return  res.render("search", { books , message: req.session.message});
      })
      .catch((error) => console.log(error));
  },
  deleteBook: (req, res) => {
    // Implement delete book
    db.Book.findByPk( req.params.id,{
      include: [{ association: "authors" }],
      where: {
        id: {
          [Op.ne]: req.params.id
        }
      }
    })
      .then( books => {
      return  res.render('home',  {books , message: req.session.message })
      } ).catch((error) => console.log(error));
  },
  authors: (req, res) => {
    db.Author.findAll()
      .then((authors) => {
      return  res.render('authors', { authors , message: req.session.message });
      })
      .catch((error) => console.log(error));
  },
  authorBooks: (req, res) => {
    // Implement books by author
    db.Author.findAll({
      include: [{ association: "books" }],
      where: {
        id: req.params.id,
      },
    })
      .then((authorBooks) => {
      return  res.render("authorBooks", { books: authorBooks[0].books , message: req.session.message });
      })
      .catch((error) => console.log(error))
  },
  register: (req, res) => {
   return res.render("register", {message: req.session.message});
  },
  processRegister: (req, res) => {
    db.User.create({
      Name: req.body.name,
      Email: req.body.email,
      Country: req.body.country,
      Pass: bcryptjs.hashSync(req.body.password, 10),
      CategoryId: req.body.category
    })
      .then(() => {
      return  res.redirect('/');
      })
      .catch((error) => console.log(error));
  },
  login: (req, res) => {
    // Implement login process
    const cookieValue = req.cookies.usuario

    if(cookieValue){
    return  res.render("login", { email: cookieValue , message: req.session.message });
    }else{
    return  res.render("login", { email:"" , message: req.session.message });
    }
  },
  processLogin: async (req, res) => {
    // Implement login process
    const userToValidate = {
      email: req.body.email,
      password: req.body.password,
    };
    
    if(userToValidate.email.length != 0){
      res.cookie("usuario", userToValidate.email)
    }
    
    const books = await db.Book.findAll({ include: [{ association: "authors" }]})
    const userFound = db.User.findOne({
      where: {
        email: userToValidate.email,
      }
    });

    userFound.then( user => {
      if(user){

        let comparePassword = bcryptjs.compareSync(userToValidate.password, user.Pass);

        if (comparePassword) {
          req.session.message = {
            success: `Usuario ${user.Name} logueado`,
            rol: `${user.CategoryId }` 
          }    

        res.redirect('/')
        } else {
          req.session.message = {
            error: `Hay un error en los datos ingresados, verifique e intente nuevamente`
          }  
        return  res.render("login", { email: req.cookies.usuario, message:req.session.message });
        }
      }else{
        req.session.message = {
          error: `Hay un error en los datos ingresados, verifique e intente nuevamente`
        }  
      return  res.render("login", { email: req.cookies.usuario, message:req.session.message });
      }
    })
  },
  logout: async(req , res) =>{
    await db.Book.findAll({ include: [{ association: "authors" }]})
    req.session.destroy();
    return res.redirect('/')
  },
  edit: (req, res) => {
    // Implement edit book
    let id = req.params.id;
    db.Book.findByPk(id).then((book) => {
    return  res.render('editBook', { book , message: req.session.message });
    })
  },
  processEdit: (req, res) => {
    // Implement edit book
    const { title, cover, description } = req.body;

    let editedBook = {
      title,
      cover,
      description,
    };

    db.Book.update(editedBook, {
      where: {
        id: req.params.id,
      },
    });

    
      
      return  res.redirect('/')
      
      .catch((error) => console.log(error));
  }
};

module.exports = mainController;
