import test from 'node:test'
import assert from 'node:assert/strict'

process.env.NODE_ENV = 'development'

const { projectCreateSchema, articleCreateSchema } = await import('../src/utils/validation.js')
const { verifyReferencedPublicIdsExist } = await import('../src/modules/image/image.service.js')
const { createProjectService } = await import('../src/modules/project/project.service.js')
const { createArticleService } = await import('../src/modules/article/article.service.js')
const { Image } = await import('../src/DB/model/image.model.js')

test('Backward-compatible old Project and Article structures pass Zod validation', () => {
    const oldProject = projectCreateSchema.safeParse({
        title: 'Legacy BI Project',
        subtitle: 'Sales dashboard',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
        images: ['https://example.com/screen1.png'],
        description: 'Plain text description'
    })
    assert.equal(oldProject.success, true)

    const oldArticle = articleCreateSchema.safeParse({
        title: 'Legacy Article',
        content: '# Hello World\nOld article body.',
        coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71'
    })
    assert.equal(oldArticle.success, true)
})

test('New Project and Article structures with thumbnailImage, gallery (<=20), and Markdown description (<=20000) validate properly', () => {
    const validGallery = Array.from({ length: 20 }, (_, i) => ({
        publicId: `portfolio/gallery/shot-${i}`,
        width: 1200,
        height: 800,
        alt: `Shot ${i}`,
        altAr: `لقطة ${i}`,
        caption: `Caption ${i}`,
        captionAr: `وصف ${i}`
    }))

    const newProject = projectCreateSchema.safeParse({
        title: 'Modern Cloudinary Project',
        thumbnailImage: {
            publicId: 'portfolio/thumbnail/main',
            width: 1200,
            height: 630,
            alt: 'Main cover',
            altAr: 'صورة الغلاف'
        },
        gallery: validGallery,
        description: `# Markdown Overview\n\n${'a'.repeat(19950)}`
    })
    assert.equal(newProject.success, true)

    // Reject gallery > 20 items
    const tooManyGallery = projectCreateSchema.safeParse({
        title: 'Too many gallery items',
        gallery: [...validGallery, { publicId: 'portfolio/gallery/extra' }]
    })
    assert.equal(tooManyGallery.success, false)

    // Reject description > 20000 chars
    const tooLongDesc = projectCreateSchema.safeParse({
        title: 'Too long description',
        description: 'x'.repeat(20001)
    })
    assert.equal(tooLongDesc.success, false)

    // New Article with thumbnailImage
    const newArticle = articleCreateSchema.safeParse({
        title: 'Modern Article',
        content: 'Body content',
        thumbnailImage: {
            publicId: 'portfolio/thumbnail/art-cover',
            width: 1200,
            height: 630,
            alt: 'Cover',
            altAr: 'غلاف'
        }
    })
    assert.equal(newArticle.success, true)
})

test('verifyReferencedPublicIdsExist rejects missing publicIds and accepts existing ones', async (t) => {
    t.mock.method(Image, 'find', () => ({
        select: () => ({
            lean: async () => [{ publicId: 'portfolio/thumbnail/exists' }]
        })
    }))

    assert.equal(await verifyReferencedPublicIdsExist(['portfolio/thumbnail/exists']), true)

    await assert.rejects(
        () => verifyReferencedPublicIdsExist(['portfolio/thumbnail/exists', 'portfolio/gallery/missing']),
        /does not exist in Image collection/
    )
})

test('In-memory project & article services preserve both old and new data structures without migration', async () => {
    const oldProj = await createProjectService({
        title: 'Old Project',
        thumbnail: 'https://example.com/old.jpg'
    })
    assert.equal(oldProj.thumbnail, 'https://example.com/old.jpg')
    assert.equal(oldProj.thumbnailImage, undefined)

    const newProj = await createProjectService({
        title: 'New Project',
        thumbnailImage: { publicId: 'portfolio/thumbnail/p1', width: 800, height: 600, alt: 'P1', altAr: 'صورة' },
        gallery: [{ publicId: 'portfolio/gallery/g1', width: 1200, height: 800, caption: 'Cap', captionAr: 'تعليق' }],
        description: '## Markdown Heading'
    })
    assert.equal(newProj.thumbnailImage.publicId, 'portfolio/thumbnail/p1')
    assert.equal(newProj.gallery.length, 1)
    assert.equal(newProj.description, '## Markdown Heading')

    const newArt = await createArticleService({
        title: 'New Article',
        content: 'Article content',
        thumbnailImage: { publicId: 'portfolio/thumbnail/a1', width: 1200, height: 630, alt: 'A1', altAr: 'مقال' }
    })
    assert.equal(newArt.thumbnailImage.publicId, 'portfolio/thumbnail/a1')
})
