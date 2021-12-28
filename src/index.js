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

app.get('/statement', (request, response) => {
  const { costumer } = request
  
  return response.json(costumer.statement)
})

app.post('/deposit', (request, response) => {
  const { description, amout } = request.body
  const { costumer } = request

  const statementOperation = {
    description,
    amout,
    createdAt: new Date(),
    type: 'credit'
  }

  costumer.statement.push(statementOperation)

  return response.status(201).send()
})

app.listen(3333)