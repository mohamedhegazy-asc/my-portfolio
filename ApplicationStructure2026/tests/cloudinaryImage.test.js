import test from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

process.env.NODE_ENV = 'development'
process.env.JWT_SECRET = 'test-jwt-secret-key-for-p3-cloudinary-suite-1234567890'
process.env.ADMIN_CREDENTIAL_HASH = await bcrypt.hash('01015112428', 4)

const { createApp } = await import('../src/app.bootstrap.js')
const { setCloudinarySdkForTests } = await import('../src/modules/image/cloudinary.client.js')
const { registerImageService, deleteImageService, getImageUsageService } = await import('../src/modules/image/image.service.js')
const { Image } = await import('../src/DB/model/image.model.js')
const { Project } = await import('../src/DB/model/project.model.js')
const { Article } = await import('../src/DB/model/article.model.js')
const { Profile } = await import('../src/DB/model/profile.model.js')

const app = createApp()

async function loginAsAdmin() {
    const res = await request(app)
        .post('/api/admin/login')
        .set('x-forwarded-for', '198.51.100.88')
        .send({ phone: '01015112428', confirmPhone: '01015112428' })
    assert.equal(res.status, 200)
    return res.headers['set-cookie'][0].split(';')[0]
}

test('Cloudinary image endpoints require admin authentication (401)', async () => {
    const endpoints = [
        ['post', '/api/admin/images/sign'],
        ['post', '/api/admin/images'],
        ['get', '/api/admin/images'],
        ['put', '/api/admin/images/507f1f77bcf86cd799439011'],
        ['get', '/api/admin/images/507f1f77bcf86cd799439011/usage'],
        ['delete', '/api/admin/images/507f1f77bcf86cd799439011']
    ]

    for (const [method, url] of endpoints) {
        const res = await request(app)[method](url)
        assert.equal(res.status, 401, `${method.toUpperCase()} ${url} must return 401 without cookie`)
    }
})

test('Missing Cloudinary env vars return 503 on image endpoints without breaking /api/health', async () => {
    const prev = {
        name: process.env.CLOUDINARY_CLOUD_NAME,
        key: process.env.CLOUDINARY_API_KEY,
        secret: process.env.CLOUDINARY_API_SECRET
    }
    delete process.env.CLOUDINARY_CLOUD_NAME
    delete process.env.CLOUDINARY_API_KEY
    delete process.env.CLOUDINARY_API_SECRET

    try {
        const cookie = await loginAsAdmin()
        const signRes = await request(app)
            .post('/api/admin/images/sign')
            .set('Cookie', cookie)
            .send({ purpose: 'thumbnail' })
        assert.equal(signRes.status, 503)

        const healthRes = await request(app).get('/api/health')
        assert.equal(healthRes.status, 200)
    } finally {
        if (prev.name !== undefined) process.env.CLOUDINARY_CLOUD_NAME = prev.name
        if (prev.key !== undefined) process.env.CLOUDINARY_API_KEY = prev.key
        if (prev.secret !== undefined) process.env.CLOUDINARY_API_SECRET = prev.secret
    }
})

test('POST /api/admin/images/sign validates purpose, returns signature, and never exposes API secret', async () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud'
    process.env.CLOUDINARY_API_KEY = '1234567890'
    process.env.CLOUDINARY_API_SECRET = 'super-secret-value-never-leak'

    const cookie = await loginAsAdmin()

    const badPurpose = await request(app)
        .post('/api/admin/images/sign')
        .set('Cookie', cookie)
        .send({ purpose: 'avatar' })
    assert.equal(badPurpose.status, 400)

    const okRes = await request(app)
        .post('/api/admin/images/sign')
        .set('Cookie', cookie)
        .send({ purpose: 'thumbnail' })
    assert.equal(okRes.status, 200)
    assert.equal(okRes.body.data.cloudName, 'demo-cloud')
    assert.equal(okRes.body.data.apiKey, '1234567890')
    assert.equal(okRes.body.data.folder, 'portfolio/thumbnail')
    assert.ok(okRes.body.data.signature)
    assert.ok(!JSON.stringify(okRes.body).includes('super-secret-value-never-leak'))
})

test('Cloudinary Admin API verification rejects invalid format, >10MB, wrong folder, and accepts valid image', async (t) => {
    const fakeId = new mongoose.Types.ObjectId()

    t.mock.method(Image, 'findOne', () => ({ lean: async () => null }))
    t.mock.method(Image, 'create', async (doc) => ({
        ...doc,
        _id: fakeId,
        toObject: () => ({ ...doc, _id: fakeId })
    }))

    // 1. Disapproved folder
    await assert.rejects(
        () => registerImageService({ publicId: 'random/pic', purpose: 'gallery' }),
        /approved folder/
    )

    // 2. Disallowed format (svg)
    setCloudinarySdkForTests({
        api: {
            resource: async () => ({
                public_id: 'portfolio/gallery/icon',
                resource_type: 'image',
                format: 'svg',
                bytes: 2048,
                width: 100,
                height: 100
            })
        }
    })
    await assert.rejects(
        () => registerImageService({ publicId: 'portfolio/gallery/icon', purpose: 'gallery' }),
        /not allowed/
    )

    // 3. Oversized (> 10 MB)
    setCloudinarySdkForTests({
        api: {
            resource: async () => ({
                public_id: 'portfolio/gallery/huge',
                resource_type: 'image',
                format: 'png',
                bytes: 11 * 1024 * 1024,
                width: 4000,
                height: 3000
            })
        }
    })
    await assert.rejects(
        () => registerImageService({ publicId: 'portfolio/gallery/huge', purpose: 'gallery' }),
        /10 MB/
    )

    // 4. Valid verified resource
    setCloudinarySdkForTests({
        api: {
            resource: async () => ({
                public_id: 'portfolio/gallery/chart1',
                secure_url: 'https://res.cloudinary.com/demo-cloud/image/upload/v1/portfolio/gallery/chart1.webp',
                resource_type: 'image',
                format: 'webp',
                bytes: 250000,
                width: 1200,
                height: 800,
                asset_folder: 'portfolio/gallery'
            })
        }
    })
    const created = await registerImageService({
        publicId: 'portfolio/gallery/chart1',
        purpose: 'gallery',
        alt: 'Sales chart',
        altAr: 'رسم بياني للمبيعات'
    })
    assert.equal(created.format, 'webp')
    assert.equal(created.purpose, 'gallery')
    assert.equal(created.bytes, 250000)

    setCloudinarySdkForTests(null)
})

test('DELETE /api/admin/images/:id returns 409 when in use and deletes via Cloudinary when unused', async (t) => {
    process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud'
    process.env.CLOUDINARY_API_KEY = '1234567890'
    process.env.CLOUDINARY_API_SECRET = 'super-secret-value-never-leak'

    const imgId = new mongoose.Types.ObjectId()
    const sampleImg = {
        _id: imgId,
        publicId: 'portfolio/thumbnail/cover1',
        secureUrl: 'https://res.cloudinary.com/demo-cloud/image/upload/v1/portfolio/thumbnail/cover1.webp'
    }

    t.mock.method(Image, 'findById', () => ({ lean: async () => sampleImg }))

    // Case A: Image is referenced in a Project -> 409 Conflict with usage details
    t.mock.method(Project, 'find', () => ({ select: () => ({ lean: async () => [{ _id: 'p1', title: 'Sales BI', slug: 'sales-bi' }] }) }))
    t.mock.method(Article, 'find', () => ({ select: () => ({ lean: async () => [] }) }))
    t.mock.method(Profile, 'find', () => ({ select: () => ({ lean: async () => [] }) }))

    const cookie = await loginAsAdmin()
    const conflictRes = await request(app)
        .delete(`/api/admin/images/${imgId.toString()}`)
        .set('Cookie', cookie)

    assert.equal(conflictRes.status, 409)
    assert.equal(conflictRes.body.usage.inUse, true)
    assert.equal(conflictRes.body.usage.projects.length, 1)

    // Case B: Unused -> uploader.destroy called & 200 returned
    t.mock.method(Project, 'find', () => ({ select: () => ({ lean: async () => [] }) }))
    let destroyedPublicId = null
    setCloudinarySdkForTests({
        uploader: {
            destroy: async (pid) => {
                destroyedPublicId = pid
                return { result: 'ok' }
            }
        }
    })
    t.mock.method(Image, 'findByIdAndDelete', async () => sampleImg)

    const usage = await getImageUsageService(imgId.toString())
    assert.equal(usage.inUse, false)

    const okDel = await deleteImageService(imgId.toString())
    assert.equal(okDel.deleted, true)
    assert.equal(destroyedPublicId, 'portfolio/thumbnail/cover1')

    setCloudinarySdkForTests(null)
})
