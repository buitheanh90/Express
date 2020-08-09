const db = require("../db");
const date = require("date-and-time");
const bcrypt = require("bcrypt");

const cloudinary = require("cloudinary");
require("../handlers/mongo");
const Users = require("../models/users/users.model");
const nodemailer = require("nodemailer");

module.exports.index = (req, res) => {
  Users.find((err, data) => {
    if (err) throw err;
    res.render("users/users", {
      users: data,
    });
  });
};

module.exports.search = (req, res) => {
  const q = req.query.q;
  const matchedUsers = db
    .get("users")
    .value()
    .filter((user) => {
      return user.name.toLowerCase().indexOf(q.toLowerCase()) !== -1;
    });

  res.render("users/users", {
    users: matchedUsers,
    values: q,
  });
};

module.exports.view = async (req, res) => {
  await Users.findById(req.params.id, (err, data) => {
    if (err) {
      res.json({ Mgs: err });
    } else {
      res.render("users/view", { user: data });
    }
  });
};

module.exports.create = (req, res) => {
  res.render("users/create");
};

module.exports.postCreate = async (req, res) => {
  await Users.findOne({ email: req.body.email }, async (err, user) => {
    if (user) {
      res.send("Username has been used");
      return;
    } else {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const day = date.format(new Date(), "DD-MM-YYYY");

      const user = new Users();
      user.name = req.body.name;
      user.email = req.body.email;
      user.password = hashedPassword;
      user.dayCreate = day;
      user.save((err, user) => {
        res.send(user);
      });
    }
  });
};

module.exports.sendEmail = (req, res) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "buitheanh1990@gmail.com",
      pass: "lgesuxvcucenwrki",
    },
  });

  const mailOptions = {
    from: "buitheanh1990@gmail.com",
    to: "buitheanh1990@gmail.com",
    subject: "Test mail",
    text: "Enter the detail here",
    html: "<b>This contains the html<b>",
  };

  //Nodemailer SendMail
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Email sent :" + info.response);
    }
  });
};
