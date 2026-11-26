import test from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import bcrypt from 'bcryptjs'

process.env.NODE_ENV = 'development'
process.env.JWT_SECRET = 'test-jwt-secret-key-for-p1-file-upload-suite-1234567890'
process.env.ADMIN_CREDENTIAL_HASH = await bcrypt.hash('01015112428', 4)

const { createApp } = await import('../src/app.bootstrap.js')
const { inspectFileBuffer } = await import('../src/modules/asset/fileInspector.js')
const { validateAssetMetadata, MAX_ASSET_SIZE_BYTES } = await import('../src/modules/asset/asset.service.js')

const app = createApp()

// Helper: build a minimal valid ZIP buffer from an array of entry names (stored, 0 bytes each)
function buildSyntheticZip(entryNames) {
    const localHeaders = []
    const centralHeaders = []
    let offset = 0

    for (const name of entryNames) {
        const nameBuf = Buffer.from(name, 'utf8')
        const local = Buffer.alloc(30 + nameBuf.length)
        local.writeUInt32LE(0x04034b50, 0)
        local.writeUInt16LE(20, 4)
        local.writeUInt16LE(nameBuf.length, 26)
        nameBuf.copy(local, 30)
        localHeaders.push(local)

        const central = Buffer.alloc(46 + nameBuf.length)
        central.writeUInt32LE(0x02014b50, 0)
        central.writeUInt16LE(20, 4)
        central.writeUInt16LE(20, 6)
        central.writeUInt16LE(nameBuf.length, 28)
        central.writeUInt32LE(offset, 42)
        nameBuf.copy(central, 46)
        centralHeaders.push(central)

        offset += local.length
    }

    const cdSize = centralHeaders.reduce((s, b) => s + b.length, 0)
    const eocd = Buffer.alloc(22)
    eocd.writeUInt32LE(0x06054b50, 0)
    eocd.writeUInt16LE(entryNames.length, 8)
    eocd.writeUInt16LE(entryNames.length, 10)
    eocd.writeUInt32LE(cdSize, 12)
    eocd.writeUInt32LE(offset, 16)

    return Buffer.concat([...localHeaders, ...centralHeaders, eocd])
}

test('GET /api/admin/assets/config requires admin auth (401 -> 200)', async () => {
    const unauth = await request(app).get('/api/admin/assets/config')
    assert.equal(unauth.status, 401)

    const login = await request(app)
        .post('/api/admin/login')
        .set('x-forwarded-for', '198.51.100.77')
        .send({ phone: '01015112428', confirmPhone: '01015112428' })
    const cookie = login.headers['set-cookie'][0].split(';')[0]

    const authed = await request(app)
        .get('/api/admin/assets/config')
        .set('Cookie', cookie)
    assert.equal(authed.status, 200)
    assert.equal(authed.body.success, true)
    assert.ok(authed.body.data.allowedExtensions.includes('docx'))
    assert.ok(authed.body.data.allowedExtensions.includes('pptx'))
    assert.deepEqual(authed.body.data.legacyExtensions.sort(), ['doc', 'ppt', 'xls'])
})

test('Valid file signatures pass inspection (.xlsx, .docx, .pptx, .pdf, .png, .jpg, .webp, .csv, legacy OLE2)', () => {
    assert.equal(inspectFileBuffer(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00]), 'png').verifiedSignature, true)
    assert.equal(inspectFileBuffer(Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), 'jpg').verifiedSignature, true)
    assert.equal(inspectFileBuffer(Buffer.from('RIFF\x00\x00\x00\x00WEBP', 'ascii'), 'webp').verifiedSignature, true)
    assert.equal(inspectFileBuffer(Buffer.from('%PDF-1.7\n', 'ascii'), 'pdf').verifiedSignature, true)
    assert.equal(inspectFileBuffer(Buffer.from('col1,col2\n1,2\n', 'utf8'), 'csv').verifiedSignature, true)

    const ole2 = Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1, 0x00])
    assert.equal(inspectFileBuffer(ole2, 'doc').verifiedSignature, true)
    assert.equal(inspectFileBuffer(ole2, 'xls').verifiedSignature, true)
    assert.equal(inspectFileBuffer(ole2, 'ppt').verifiedSignature, true)

    assert.equal(inspectFileBuffer(buildSyntheticZip(['[Content_Types].xml', 'xl/workbook.xml']), 'xlsx').verifiedSignature, true)
    assert.equal(inspectFileBuffer(buildSyntheticZip(['[Content_Types].xml', 'word/document.xml']), 'docx').verifiedSignature, true)
    assert.equal(inspectFileBuffer(buildSyntheticZip(['[Content_Types].xml', 'ppt/presentation.xml']), 'pptx').verifiedSignature, true)
})

test('Disguised files are rejected by magic-byte/content inspection', () => {
    const exeMz = Buffer.from('MZ\x90\x00\x03\x00', 'ascii')
    const svgText = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>', 'utf8')
    const pngBytes = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])

    assert.throws(() => inspectFileBuffer(exeMz, 'png'), /PNG/)
    assert.throws(() => inspectFileBuffer(exeMz, 'csv'), /MZ/)
    assert.throws(() => inspectFileBuffer(svgText, 'jpg'), /JPEG/)
    assert.throws(() => inspectFileBuffer(svgText, 'csv'), /HTML\/SVG/)
    assert.throws(() => inspectFileBuffer(pngBytes, 'pdf'), /PDF/)
    assert.throws(() => inspectFileBuffer(buildSyntheticZip(['random.txt']), 'xlsx'), /valid \.xlsx/)
})

test('Macro-enabled extensions, embedded VBA projects, and >5000 ZIP entries are rejected', () => {
    for (const bad of ['book.xlsm', 'doc.docm', 'deck.pptm', 'icon.svg', 'app.exe', 'run.js']) {
        assert.throws(() => validateAssetMetadata({
            originalName: bad,
            mimeType: 'application/octet-stream',
            size: 1024
        }), /not allowed/)
    }

    // .xlsx containing vbaProject.bin
    const macroZip = buildSyntheticZip(['[Content_Types].xml', 'xl/workbook.xml', 'xl/vbaProject.bin'])
    assert.throws(() => inspectFileBuffer(macroZip, 'xlsx'), /Macro-enabled|VBA/)

    // Archive with > 5000 entries
    const hugeEntries = Array.from({ length: 5001 }, (_, i) => `xl/file_${i}.xml`)
    const hugeZip = buildSyntheticZip(hugeEntries)
    assert.throws(() => inspectFileBuffer(hugeZip, 'xlsx'), /5000 entries/)
})

test('Oversized files exceeding MAX_UPLOAD_MB are rejected', () => {
    assert.throws(() => validateAssetMetadata({
        originalName: 'big.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: MAX_ASSET_SIZE_BYTES + 1
    }), /exceeds|between 1 byte/)
})
