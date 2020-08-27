const fs = require("fs");
const csv = require("csv-parser");
const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const upload = require("express-fileupload");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(upload());
var result = [];
app.get("/", (req, res) => {
  res.render("landing");
});
app.post("/send-files", (req, res) => {
  if (req.files) {
    let files = req.files.csvFiles;
    files.forEach((file) => {
      console.log("step 1");
      const fileName = file.name;
      file.mv("./uploads/" + fileName, (err) => {
        if (err) {
          res.render("error");
        } else {
          console.log("step 2");
          let arr = [];
          fs.createReadStream(fileName)
            .pipe(csv())
            .on("data", function (row) {
              console.log("step 3");
              arr.push(row);
            })
            .on("end", function () {
              console.log("step 4");
              arr.forEach((obj) => {
                const orderNum = obj.OrderNum;
                const saleAmount = Number(obj["Sale Amount"]);
                const costPrice = Number(obj["Cost Price"]);
                const transferredAmount = Number(obj["Transferred Amount"]);
                const commission = Number(obj.Commission);
                const paymentGateway = Number(obj["Payment Gateway"]);
                const pickPackFee = Number(obj["PickPack Fee"]);
                const proLoss =
                  saleAmount -
                  (costPrice + commission + paymentGateway + pickPackFee);
                const marketPlace = commission + paymentGateway + pickPackFee;
                console.log("step 5");
                result.push({
                  orderNum: orderNum,
                  proLoss: proLoss,
                  transferredAmount: transferredAmount,
                  marketPlace: marketPlace,
                });
              });
            });
        }
      });
    });
    res.render("message");
  } else {
    res.render("error");
  }
});
app.get("/result", (req, res) => {
  res.render("resultSheet", { data: result });
});
app.get("/error", (req, res) => {
  res.render("error");
});
app.get("/message", (req, res) => {
  res.render("message");
});
app.listen(3000, () => {
  console.log("The app is listening on port 3000");
});
