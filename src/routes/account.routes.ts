import { Router } from 'express'

const accountsRouter = Router()

accountsRouter.get('/abc', (req, res) => {
  res.send('Hello world account api get')
})

export default accountsRouter