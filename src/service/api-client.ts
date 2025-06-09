import ky from 'ky'

const api = ky.create({
  prefixUrl: 'http://localhost:8080/v3',
})

export default api
