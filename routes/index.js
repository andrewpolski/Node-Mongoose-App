var express = require("express");
var session = require("express-session");

var router = express.Router();

const UserModel = require("../model/User");
const SubjectModel = require("../model/Subject");

/* GET home page. */
router.get("/", function(req, res, next) {
  session = req.session;
  res.render("index");
});

router.get("/login", (req, res, next) => {
  res.render("login", { message: req.flash("info"), tipo: req.flash("type") });
});

router.get("/logout", (req, res, next) => {
  req.session.destroy();
  res.redirect("/");
});

router.get("/signup", (req, res, next) => {
  res.render("signUp", { message: req.flash("info") });
});

router.get("/addUserAdmin", (req, res, next) => {
  if (req.session.userSession && req.session.userSession.rol == 1) {
    res.render("addUserAdmin");
  } else {
    noPrivileges(res);
  }
});

router.get("/addSubjectAdmin", async (req, res, next) => {
  if (req.session.userSession && req.session.userSession.rol == 1) {
    var allStudents = await UserModel.findUsersByRol(3);
    var allTeachers = await UserModel.findUsersByRol(2);
    await res.render("addSubjectAdmin", {
      userSession: req.session.userSession,
      todosAlumnos: allStudents,
      todosProfesores: allTeachers,
      title: "Añadir Asignaturas"
    });
  } else {
    noPrivileges(res);
  }
});

router.get("/administrarUsuarios", async (req, res, next) => {
  if (req.session.userSession && req.session.userSession.rol == 1) {
    var usersList = await UserModel.findUsers();
    res.render("administrarUsuarios", {
      userSession: req.session.userSession,
      usersList: usersList,
      message: req.flash("info"),
      tipo: req.flash("type")
    });
  } else {
    noPrivileges(res);
  }
});
router.get("/administrarAsignaturasProfesor", async (req, res, next) => {
  if (req.session.userSession && req.session.userSession.rol == 2) {
    var subjectList = await SubjectModel.findSubjectsPopulateUsers();
    res.render("administrarAsignaturasProfesor", {
      userSession: req.session.userSession,
      subjectList: subjectList,
      title: "Administrar Asignaturas"
    });
  } else {
    noPrivileges(res);
  }
});
router.get("/administrarAsignaturas", async (req, res, next) => {
  if (req.session.userSession && req.session.userSession.rol == 1) {
    var subjectList = await SubjectModel.findSubjectsPopulateUsers();
    res.render("administrarAsignaturas", {
      userSession: req.session.userSession,
      subjectList: subjectList,
      title: "Administrar Asignaturas"
    });
  } else {
    noPrivileges(res);
  }
});
router.get("/verAsignaturasAlumno", async (req, res, next) => {
  if (req.session.userSession && req.session.userSession.rol == 3) {
    var subjectList = await SubjectModel.findStudentsSubjectsByStudentId(
      req.session.userSession.id
    );

    res.render("verAsignaturasAlumno", {
      nombre: req.session.userSession.nombre
    });
  } else {
    noPrivileges(res);
  }
});

const noPrivileges = res => {
  res.render("error", {
    errors: "You don´t have enough privileges<a href='/login'>Login</a>"
  });
};
module.exports = router;
