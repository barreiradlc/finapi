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

  costumers.push({
    cpf,
    name,
    id: uuidV4(),
    statement: []
  })

  return response.status(200).send()
})

app.use(verifyIfExistsAccount)

app.get('/statement', (request, response) => {
  const { costumer } = request

  return response.json(costumer.statement)
})

app.listen(3333)