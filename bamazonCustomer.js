let inquirer = require('inquirer');
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "bamazon"
});
// returns an object something like this 
/* 
{ threadId: 12312, connect: function(){}, query: function(){} ...}
*/


connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  listProducts();
});

function listProducts() {
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;
    var choices = []
    for (let i = 0; i < res.length; i++) {
      choices.push(res[i].item_id)
    }
    pickProduct(choices).then(function (results) {
      const productId = results.product
      quantity().then(function (results) {
        const quantity = results.quantity
        connection.query(`SELECT stock_quantity, price FROM products WHERE item_id = ${productId}`, function (err, res) {
          const stock = res[0].stock_quantity
          const price = res[0].price
          const totalPrice = quantity * price
          if (quantity > stock) {
            console.log('Insufficient quantity!')
            connection.end();
          } else {
            connection.query(`UPDATE products SET stock_quantity = stock_quantity - ${quantity} WHERE item_id = ${productId}`, function (err, res) {
              if(err) throw err;
              else console.log(`You've purchased ${quantity} of product #${productId}. Your total is ${totalPrice}.`)
              connection.end();
            })
          }
        })
      })
    })
  });
}

function pickProduct(choices) {
  return inquirer
    .prompt({
      name: "product",
      type: "list",
      message: "Enter the ID of the product youd like to buy.",
      choices: choices
    })
}

function quantity() {
  return inquirer
    .prompt({
      name: "quantity",
      input: "input",
      message: "How many would you like to buy?",
    })
}

