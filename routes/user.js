var express = require("express");
var session = require("express-session");

var router = express.Router();
const UserModel = require("..\\model\\User");

const Cryptr = require("cryptr");
const cryptr = new Cryptr("t45AS45asf");

router.get("/list", async (req, res, next) => {
  var result = await UserModel.findUsers();
  var errors = result.length ? "" : "no users";
  res.render("listUsers", { users: result, err: errors });
});

router.post("/insert", async (req, res, next) => {
  var repeatedEmail = await UserModel.checkRepeatedEmail(req.body.email);

  if (repeatedEmail) {
    req.flash("info", "Email repetido!");
    res.redirect("/signup");
  } else {
    var nombre = req.body.nombre;
    var apellido = req.body.apellido;
    var email = req.body.email;
    var pass = cryptr.encrypt(req.body.pass);
    var rol = req.body.rol;
    UserModel.createUser(nombre, apellido, email, pass, rol);
    req.flash("info", "Registered successfully!");
    req.flash("type", "success");
    res.redirect("/login");
  }
});

router.post("/delete", async (req, res, next) => {
  await UserModel.deleteUserByEmail(req.body.email);
  req.flash("info", "User deleted successfully!");
  req.flash("type", "success");
  res.redirect("/administrarUsuarios");
  if (req.body.email == req.session.email) {
    redirect("/logout");
  }
});

router.post("/login", async (req, res, next) => {
  // TODO MIRAR PORQUE LOS PARAMETROS DEL POST SE QUEDAN GUARDADOS
  // TODO REDIRECCIONAMIENTO SEGUN ROl
  var email = req.body.email;
  var pass = req.body.pass;
  var userLogin = await UserModel.loginUser(email, pass);
  if (userLogin) {
    var userSession = {
      email: userLogin.email,
      nombre: userLogin.nombre,
      apellido: userLogin.apellido,
      rol: userLogin.rol
    };
    req.session.userSession = userSession;
    switch (userSession.rol) {
      case 1:
        var usersList = await UserModel.findUsers();
        res.render("administrarUsuarios", {
          userSession: req.session.userSession,
          usersList: usersList,
          message: req.flash("info"),
          tipo: req.flash("type")
        });
        break;
      case 2:
        break;
      case 3:
        break;
      default:
        res.status(500);
        res.render("error", { errors: "Internal error" });
        break;
    }
  } else {
    req.flash("info", "Email and/or password incorrect");
    req.flash("type", "danger");
    res.redirect("/login");
  }
});

router.post("/editForward", async (req, res, next) => {
  var userEditForward = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    email: req.body.email,
    pass: req.body.pass,
    rol: req.body.rol
  };
  var userIDSearch = await UserModel.findUserIdByEmail(userEditForward.email);
  res.render("editUser", { userEdit: userEditForward, userID: userIDSearch });
});

router.post("/edit", (req, res, next) => {
  var id = req.body.idUser;
  var userUpdate = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    email: req.body.email,
    pass: req.body.pass,
    rol: req.body.rol
  };
  UserModel.updateUserById(id, userUpdate);
  req.flash("info", "User edited successfully!");
  req.flash("type", "success");
  res.redirect("/administrarUsuarios");
});

module.exports = router;