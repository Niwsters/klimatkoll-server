import { CDNServer } from './src/cdn-server'
import { HTMLServer } from './src/html-server'

const cdnPort: number = process.env.PORT ? parseInt(process.env.PORT) : 3000
const cdnServer = new CDNServer(cdnPort)

//const htmlServer = new HTMLServer(3001)
