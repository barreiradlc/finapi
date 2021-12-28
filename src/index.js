const express = require('express')
const { v4: uuidV4 } = require('uuid')
const app = express()

app.use(express.json())

const costumers = []

function verifyIfExistsAccount(request, response, next) {
  const { cpf } = request.headers

  const costumer = costumers.find(costumer => costumer.cpf === cpf)

  if(!costumer) return response.status(400).json({ message: "Costumer not found" })

  request.costumer = costumer

  return next()
}

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if(operation.type === 'credit'){
      return acc + operation.amount
    }
    return acc - operation.amount
  }, 0)

  return balance
}

app.post('/account', (request, response) => {
  const { cpf, name } = request.body

  const costumerAlreadyExists = costumers.some(costumer => costumer.cpf === cpf)

  if(costumerAlreadyExists) return response.status(400).json({ error: "Costumer already exists" })

  const newCostumer = {
    cpf,
    name,
    id: uuidV4(),
    statement: []
  }

  costumers.push(newCostumer)

  return response.json(newCostumer)
})

app.use(verifyIfExistsAccount)

app.put('/account', (request, response) => {
  const { costumer } = request
  const { name } = request.body

  costumer.name = name

  return response.json(costumer)
})

app.get('/account', (request, response) => {
  const { costumer } = request

  return response.json(costumer)
})


app.get('/statement', (request, response) => {
  const { costumer } = request
  
  return response.json(costumer.statement)
})

app.get('/statement/date', (request, response) => {
  const { costumer } = request
  const { date } = request.query

  const dateFormat = new Date(date + "00:00")

  const statement = costumer.statement.filter(statement.createdAt.toDateString() === new Date((dateFormat).toUTCString()))

   
})

app.post('/deposit', (request, response) => {
  const { description, amount } = request.body
  const { costumer } = request

  const statementOperation = {
    description,
    amount,
    createdAt: new Date(),
    type: 'credit'
  }

  costumer.statement.push(statementOperation)

  return response.status(201).send()
})

app.post('/withdraw', (request, response) => {
  const { amount } = request.body
  const { costumer } = request

  const balance = getBalance(costumer.statement)

  console.log(balance)

  if(balance < amount) return response.status(400).json({ error: 'Insulficient funds' })

  const statementOperation = {
    amount,
    description: 'withdraw',
    createdAt: new Date(),
    type: 'debit'
  }

  costumer.statement.push(statementOperation)

  return response.status(201).send()
})


app.listen(3333)