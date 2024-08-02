const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { User } = require("../schema/User");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "asadkhaksar1122@outlook.com",
    pass: process.env.PASSWORD,
  },
  tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false,
  },
});
module.exports.signupget = (req, res) => {
  res.render("route/signup.ejs");
};
module.exports.signuppost = async (req, res) => {
  try {
    let { firstname, secondname, email, password, confirmpassword } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    let newUser = new User({
      firstname: firstname,
      secondname: secondname,
      email: email,
      password: hashedPassword,
    });
    const token = await crypto.randomBytes(20).toString("hex");
    newUser.verificationToken = token;
    if (req.file) {
      newUser.profile = req.file.path
    }
    let saveduser = await newUser.save();
    console.log(saveduser);
    const mailOptions = {
      from: "asadkhaksar1122@outlook.com",
      to: saveduser.email,
      subject: "Verify your email address",
      html: `
    <p s <p style="font-size: 16px; color: #333; line-height: 1.6;">
      Dear ${saveduser.firstname} ${saveduser.secondname},
      <br><br>
      Thank you for signing up! To complete the registration process, please click on the button below to verify your email address:
      <br><br>
     <div style="text-align: center;">
  <a href="${req.protocol}://${req.get("host")}/verify/${
        saveduser.verificationToken
      }" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #fff; text-decoration: none; margin:auto; border-radius: 5px;">Verify Email</a>
</div>
      <br><br>
      If you have any questions or need assistance, feel free to contact us.
      <br><br>
      Best regards,
      <br>
      Your App Team
    </p>
  `,
    };
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent:", info);
    } catch (error) {
      console.error("Error sending email:", error);
    }
    req.flash(
      "success",
      `The email has been sent to ${saveduser.email} please verify then log in `
    );
    res.redirect("/signup");
  } catch (error) {
    if (error && error.code === 11000) {
      // Extract the duplicate key value from the error message
      const duplicateKey = /email: "(.*?)"/.exec(error.message)[1];
      req.flash("error", `The email '${duplicateKey}' already exists`);
      res.redirect("/signup");
    } else {
      console.error(error);
      // Handle other MongoDB errors
      let errormessage = error.message;
      let message = errormessage.replace("User validation failed:", "");
      req.flash("error", message);
      res.redirect("/signup");
    }
  }
};
module.exports.logout = (req, res) => {
  req.logout((error) => {
    if (error) {
      console.log(error);
      return req.flash("success", "error in log out");
    }
    res.redirect("/");
  });
};
module.exports.loginget = (req, res) => {
  res.render("route/login.ejs");
};
module.exports.loginpost = function (req, res) {
  req.flash("success", "you have been  login ");
  res.redirect("/");
};
module.exports.verifytoken = async (req, res, next) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(404).send("Invalid verification token");
    }
    user.verified = true;
    user.verificationToken = undefined;
    let saveduser = await user.save();
    req.login(user, (error) => {
      if (error) {
        req.flash("error", "something went wrong while logging");
        return res.redirect("/");
      }
      console.log("login successful");
    });
    req.flash("success", "Your email address has been verified! pleas Log in");
    res.redirect("/login");
  } catch (error) {
    console.log(error);
    res.redirect("/signup");
  }
};
module.exports.forgetpasswordget = (req, res) => {
  res.render("route/forgetpassword.ejs");
};
module.exports.forgetpasswordpost = async (req, res) => {
  try {
    let { email } = req.body;
    let user = await User.findOne({ email: email });
    if (!user) {
      req.flash("error", "The email does not exist");
      return res.redirect("/forgetpassword");
    }
    const resettoken = await crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resettoken;
    console.log(user);
    let saveduser = await user.save();
    console.log(saveduser);
    const mailOptions = {
      from: "asadkhaksar1122@outlook.com",
      to: saveduser.email,
      subject: "Verify your email address",
      html: ` <p style="font-size: 16px; color: #333; line-height: 1.6;">
     Hello ${saveduser.firstname} ${saveduser.secondname},
  <br><br>
  We have received a request to reset your password. Please click the button below to reset your password:
  <br><br>
  <div style="text-align: center;">
    <a href="${req.protocol}://${req.get("host")}/resetpassword/${
        saveduser.resetPasswordToken
      }" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #fff; text-decoration: none; margin:auto; border-radius: 5px;">Reset Password</a>
  </div>
  <br><br>
  If you did not request a password reset, please ignore this email or contact us if you have any concerns.
  <br><br>
  Regards,
  <br>
  Your App Team
  Khaksar
</p>`,
    };
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent:", info);
    } catch (error) {
      console.error("Error sending email:", error);
    }
    res.send(
      "you have been the email please verify your email and reset password"
    );
  } catch (error) {
    console.log(error);
    res.redirect("/forgetpassword");
  }
};
module.exports.resetpasswordget = async (req, res) => {
  try {
    let { resettoken } = req.params;
    let user = await User.findOne({ resetPasswordToken: resettoken });
    if (!user) {
      return res.status(404).send("the token is invalid or has been expired");
    }
    res.render("route/resetpassword.ejs", { resettoken });
  } catch (error) {
    console.log(error);
    req.flash("error", error.message);
    res.redirect("/forgetpassword");
  }
};
module.exports.resetpasswordpost = async (req, res) => {
  try {
    let { resettoken } = req.params;
    let { password, confirmpassword } = req.body;
    let user = await User.findOne({ resetPasswordToken: resettoken });
    if (!user) {
      return res.status(404).send("the token is invalid or has been expired");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    console.log(user.password);
    user.resetPasswordToken = undefined;
    let saveduser = await user.save();
    req.flash("success", "The password has been changed please log in");
    res.redirect("/login");
  } catch (error) {
    let { resettoken } = req.params;
    console.log(error);
    req.flash("error", error.message);
    res.redirect(`/resetpassword/${resettoken}`);
  }
};
module.exports.resendverificationget = (req, res) => {
  res.render("route/resendverification.ejs");
};
module.exports.resendverificationpost = async (req, res) => {
  try {
    let { email } = req.body;
    let user = await User.findOne({ email: email });
    if (!user) {
      req.flash("error", "The email does not exist please first sign up");
      return res.redirect("/signup");
    }
    if (user.verified) {
      req.flash("error", "The email is already verified please log in");
      return res.redirect("/login");
    }
    const token = await crypto.randomBytes(20).toString("hex");
    user.verificationToken = token;
    let saveduser = await user.save();
    console.log(saveduser);
    const mailOptions = {
      from: "asadkhaksar1122@outlook.com",
      to: saveduser.email,
      subject: "Verify your email address",
      html: `
    <p s <p style="font-size: 16px; color: #333; line-height: 1.6;">
      Dear ${saveduser.firstname} ${saveduser.secondname},
      <br><br>
      Thank you for signing up! To complete the registration process, please click on the button below to verify your email address:
      <br><br>
     <div style="text-align: center;">
  <a href="${req.protocol}://${req.get("host")}/verify/${
        saveduser.verificationToken
      }" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #fff; text-decoration: none; margin:auto; border-radius: 5px;">Verify Email</a>
</div>
      <br><br>
      If you have any questions or need assistance, feel free to contact us.
      <br><br>
      Best regards,
      <br>
      Your App Team
    </p>
  `,
    };
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent:", info);
    } catch (error) {
      console.error("Error sending email:", error);
    }
    res.send("The verification email has been sent to your account");
  } catch (error) {
    console.log(error);
    req.flash("error", error.message);
    res.redirect("/resendverificationtoken");
  }
};