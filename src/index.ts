import consola from 'consola'
import { app } from './app'
import { dbUP } from './db'

const PORT = 3000

app.listen(PORT, async () => {
  consola.log(`▶ Server running on http://localhost:${PORT}`)
  await dbUP()
})
