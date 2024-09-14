import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import { dbClose, dbDown, dbUP } from '../src/db'

describe('❯ Validate request', () => {
  beforeAll(async () => {
    await dbUP()
  })

  afterAll(async () => {
    await dbDown()
    await dbClose()
  })

  it('● GET /', async () => {
    const { headers, status, body } = await request(app.callback())
      .get('/')
      .set('Accept', 'application/json')
    expect(headers['content-type']).toMatch(/json/)
    expect(status).toEqual(200)
    expect(body).toStrictEqual({
      message: 'Root',
      data: {},
      error: {},
    })
  })

  it('● GET /status', async () => {
    const { headers, status, body } = await request(app.callback())
      .get('/status')
      .set('Accept', 'application/json')
    expect(headers['content-type']).toMatch(/json/)
    expect(status).toEqual(200)
    expect(body).toEqual({
      message: 'Status',
      data: {
        status: true,
      },
      error: {},
    })
  })

  it('● GET /invalid', async () => {
    const { headers, status, body } = await request(app.callback())
      .get('/invalid')
      .set('Accept', 'application/json')
    expect(headers['content-type']).toMatch(/json/)
    expect(status).toEqual(404)
    expect(body).toEqual({
      message: 'Route Not Found',
    })
  })

  it('● GET /health', async () => {
    const { headers, status, body } = await request(app.callback())
      .get('/health')
      .set('Accept', 'application/json')
    expect(headers['content-type']).toMatch(/json/)
    expect(status).toEqual(200)
    expect(body).toEqual({
      message: 'Health',
      data: {
        db: true,
        redis: false,
      },
      error: {},
    })
  })

  it('● POST /user', async () => {
    const validResponse = await request(app.callback())
      .post('/user')
      .send({
        name: 'Test User',
        email: 'test@test.com',
        address: 'Test Address',
        phone: '+10000000000',
      })
      .set('Accept', 'application/json')
    expect(validResponse.headers['content-type']).toMatch(/json/)
    expect(validResponse.status).toEqual(200)
    expect(validResponse.body.data).toBeDefined()
    expect(Object.keys(validResponse.body)).toStrictEqual(['message', 'data', 'error'])
    expect(Object.keys(validResponse.body.data)).toStrictEqual(['_id', 'name', 'email', 'phone', 'address'])

    const invalidResponse = await request(app.callback())
      .post('/user')
      .send({
        name: 'Test',
        email: 'test@test.com',
        address: 'Test Address',
        phone: '+10000000000',
      })
      .set('Accept', 'application/json')
    expect(invalidResponse.headers['content-type']).toMatch(/json/)
    expect(invalidResponse.status).toEqual(403)
    expect(invalidResponse.body.error.length).toBe(1)
    expect(invalidResponse.body.error[0].input).toStrictEqual('Test')
  })

  it('● GET /users', async () => {
    const { headers, status, body } = await request(app.callback())
      .get('/users')
      .set('Accept', 'application/json')
    expect(headers['content-type']).toMatch(/json/)
    expect(status).toEqual(200)
    expect(body.data.length).toBe(1)
    expect(Object.keys(body.data[0])).toStrictEqual(['_id', 'name', 'email', 'phone', 'address'])
  })
})
