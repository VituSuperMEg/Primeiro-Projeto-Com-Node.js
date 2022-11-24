const express = require('express');
const app = express();
const port = 3333;
const { v4 : uuidv4 } = require("uuid");


app.use(express.json());
/**
 * 
 * cpf - string
 * name - string
 * id - uuid
 * statemnt []
 * 
 */

// Middleware

function verifyIfExistsAccountCPF(req,res,next){

    const { cpf } = req.headers;

    const customer = customers.find((customer) => customer.cpf === cpf);

    if(!customer) {
        return res.status(400).json({error : "Customer not found"});
    }
    req.customer = customer;

    return next();
}

function getBalance(statement){
   const balance = statement.reduce((acc, operation) => {
    if(operation.type === 'credit'){
        return acc + operation.amount;
    }else{
        return acc - operation.amount;
    }
   }, 0)

   return balance;
}

const customers = [];

app.post('/account', (req, res) => {

    const { cpf, name } = req.body;

    const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf);
     
    if (customerAlreadyExists){
        return res.status(400).json({error : "Customer Already Exists"})
    }
    customers.push({
        cpf, 
        name,
        id :  uuidv4(),
        statement : []
    });

    return res.status(201).send();
});

app.get('/statement', verifyIfExistsAccountCPF, (req, res) => {
   const { customer } = req;

   return res.json(customer.statement);

});

app.post("/deposit", verifyIfExistsAccountCPF, (req, res) => {
   
    const {description, amount } = req.body;

    const { customer } = req;

    const statemnetOperation = {
        description,
        amount,
        create_at : new Date(),
        type : "credit"
    }
    customer.statement.push(statemnetOperation);

    return res.status(201).send();

});

app.post("/withdraw", verifyIfExistsAccountCPF, (req,res) => {
  const { amount } = req.body;
  const { customer } = req;

  const balance = getBalance(customer.statement);

  if(balance < amount){
    return res.status(400).json({error : "Insufficient funds!"})
  }

  const statementOperation = {
    amout,
    create_at : new Date()  ,
    type : 'debit'
   };

   customer.statement.push(statementOperation);

   return res.status(201).send();
});

app.get('/statement/date', verifyIfExistsAccountCPF, (req, res) => {
    const { customer } = req;
    const { date } = req.query;

    const dateFormat = new Date(date + "00:00");

    const statement = customer.statement.filter((statement) => statement.create_at.toDateString() === new Date(dateFormat).toDateString())

    return res.json(statement);
 
});

app.put("/account" , verifyIfExistsAccountCPF,  (req, res) => {
    const { name } = req.body;
    const { customer } = req;
    
    customer.name = name;

    return res.status(201).send()
})

app.get("/account", verifyIfExistsAccountCPF, (req, res) => {
    const { customer } = req;

    return res.json(customer);
})

app.delete("/account" , verifyIfExistsAccountCPF, (res, req) => {
    const { customer } = req;

    customers.splice(customer, 1);

    return res.status(200).json(customers)
});
app.get("balance", verifyIfExistsAccountCPF, (req, res) => {
    const { customer } = req;

    const balance = getBalance(customer.statement);

    return res.json(balance);
})
app.listen(port, () => {
    console.log("Servidor no ar!🐒");
});