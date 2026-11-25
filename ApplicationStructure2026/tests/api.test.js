import test from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import bcrypt from 'bcryptjs'

process.env.NODE_ENV = 'development'
process.env.JWT_SECRET = 'test-jwt-secret-key-for-p6-verification-suite-1234567890'
process.env.ADMIN_CREDENTIAL_HASH = await bcrypt.hash('01015112428', 4)
process.env.CLIENT_URL = 'https://my-portfolio-client-six-flame.vercel.app'
process.env.ANALYTICS_SALT = 'test-analytics-salt'

const { createApp } = await import('../src/app.bootstrap.js')
const app = createApp()

let adminCookie = null

test('GET /api/health returns 200 with readyState', async () => {
    const res = await request(app).get('/api/health')
    assert.equal(res.status, 200)
    assert.ok('readyState' in res.body)
})

test('Protected-route matrix returns 401 when unauthenticated', async () => {
    const protectedCalls = [
        request(app).post('/api/projects').send({ title: 'X' }),
        request(app).put('/api/projects/123').send({ title: 'X' }),
        request(app).delete('/api/projects/123'),
        request(app).post('/api/articles').send({ title: 'X', content: 'Y' }),
        request(app).put('/api/articles/123').send({ title: 'X' }),
        request(app).delete('/api/articles/123'),
        request(app).put('/api/profile').send({ title: 'X' }),
        request(app).get('/api/contact/messages'),
        request(app).patch('/api/contact/messages/123/read').send({ isRead: true }),
        request(app).patch('/api/contact/messages/123/star').send({ isStarred: true }),
        request(app).delete('/api/contact/messages/123'),
        request(app).get('/api/analytics'),
        request(app).get('/api/admin/assets'),
        request(app).post('/api/admin/assets').send({}),
        request(app).delete('/api/admin/assets/123'),
    ]
    const results = await Promise.all(protectedCalls)
    for (const r of results) {
        assert.equal(r.status, 401, `Expected 401 but got ${r.status}`)
    }
})

test('Admin login works with normalized phone and sets httpOnly cookie', async () => {
    const res = await request(app)
        .post('/api/admin/login')
        .set('x-forwarded-for', '198.51.100.10')
        .send({ phone: '+20 101 511 2428', confirmPhone: '01015112428' })

    assert.equal(res.status, 200)
    assert.equal(res.body.success, true)
    const cookies = res.headers['set-cookie'] || []
    assert.ok(cookies.some(c => c.startsWith('admin_session=') && c.includes('HttpOnly')))
    adminCookie = cookies[0].split(';')[0]
})

test('Strict Zod validation rejects unknown fields and mass-assignment', async () => {
    const res = await request(app)
        .post('/api/projects')
        .set('Cookie', adminCookie)
        .send({
            title: 'Valid Title',
            clicks: 999999,
            unknownHackerField: 'boom'
        })

    assert.equal(res.status, 400)
    assert.equal(res.body.success, false)
})

test('Public contact & analytics validation rejects invalid payloads', async () => {
    const badContact = await request(app)
        .post('/api/contact')
        .send({ name: 'A', email: 'not-an-email', message: 'short' })
    assert.equal(badContact.status, 400)

    const badTrack = await request(app)
        .post('/api/analytics/track')
        .send({ event: 'evil_event' })
    assert.equal(badTrack.status, 400)
})

test('Public vs Private access restrictions and pagination shape', async () => {
    const created = await request(app)
        .post('/api/projects')
        .set('Cookie', adminCookie)
        .send({
            title: 'Secret Draft Project',
            subtitle: 'Internal',
            status: 'private',
            published: false
        })
    assert.equal(created.status, 201)

    const pubList = await request(app).get('/api/projects?all=true&page=1&limit=10')
    assert.equal(pubList.status, 200)
    assert.equal(pubList.body.page, 1)
    assert.equal(pubList.body.limit, 10)
    assert.equal(typeof pubList.body.total, 'number')
    assert.ok(pubList.headers['cache-control']?.includes('s-maxage=60'))
    assert.equal(pubList.body.data.some(p => p.slug === 'secret-draft-project'), false)

    const pubSlug = await request(app).get('/api/projects/secret-draft-project')
    assert.equal(pubSlug.status, 404)

    const adminSlug = await request(app)
        .get('/api/projects/secret-draft-project')
        .set('Cookie', adminCookie)
    assert.equal(adminSlug.status, 200)
})
