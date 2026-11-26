/**
 * Magic-byte signature & OOXML ZIP Central Directory inspector.
 * Never extracts archive contents to disk or memory.
 */

const MAX_ZIP_ENTRIES = 5000

const DANGEROUS_ZIP_EXTS = /\.(exe|dll|bat|cmd|sh|ps1|vbs|vbe|js|mjs|cjs|svg|html|htm|php|py|scr|msi|com|pif)$/i
const VBA_ENTRY_REGEX = /(^|\/)(vbaProject\.bin|vbaData\.xml|macros\/)/i

const OLE2_MAGIC = Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])

/**
 * Inspects a ZIP Central Directory without extracting any entries.
 * Returns { entryCount, entries } or throws on malformed/dangerous archives.
 */
export function inspectZipCentralDirectory(buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length < 22) {
        throw new Error('Invalid or truncated ZIP archive.')
    }

    // Locate End of Central Directory (EOCD) signature: 0x06054b50
    const searchStart = Math.max(0, buffer.length - 65557)
    let eocdOffset = -1
    for (let i = buffer.length - 22; i >= searchStart; i--) {
        if (buffer.readUInt32LE(i) === 0x06054b50) {
            eocdOffset = i
            break
        }
    }
    if (eocdOffset === -1) {
        throw new Error('Missing ZIP End of Central Directory record.')
    }

    const totalEntries = buffer.readUInt16LE(eocdOffset + 10)
    const cdSize = buffer.readUInt32LE(eocdOffset + 12)
    const cdOffset = buffer.readUInt32LE(eocdOffset + 16)

    if (totalEntries > MAX_ZIP_ENTRIES) {
        throw new Error(`Archive exceeds maximum allowed ${MAX_ZIP_ENTRIES} entries.`)
    }
    if (cdOffset + cdSize > buffer.length) {
        throw new Error('Corrupted ZIP central directory bounds.')
    }

    const entries = []
    let pos = cdOffset
    let count = 0

    while (pos < cdOffset + cdSize && pos + 46 <= buffer.length) {
        const sig = buffer.readUInt32LE(pos)
        if (sig !== 0x02014b50) {
            throw new Error('Invalid ZIP central directory header.')
        }
        count++
        if (count > MAX_ZIP_ENTRIES) {
            throw new Error(`Archive exceeds maximum allowed ${MAX_ZIP_ENTRIES} entries.`)
        }

        const nameLen = buffer.readUInt16LE(pos + 28)
        const extraLen = buffer.readUInt16LE(pos + 30)
        const commentLen = buffer.readUInt16LE(pos + 32)
        const nameEnd = pos + 46 + nameLen
        if (nameEnd > buffer.length) {
            throw new Error('Truncated ZIP entry name.')
        }

        const entryName = buffer.slice(pos + 46, nameEnd).toString('utf8')
        entries.push(entryName)
        pos = nameEnd + extraLen + commentLen
    }

    return { entryCount: count, entries }
}

/**
 * Validates OOXML (.xlsx, .docx, .pptx) ZIP entries for macros, traversal, and structure.
 */
function verifyOoxmlBuffer(buffer, ext) {
    if (buffer.length < 4 || buffer.readUInt32LE(0) !== 0x04034b50) {
        throw new Error(`File signature does not match '.${ext}' (expected ZIP/OOXML).`)
    }

    const { entryCount, entries } = inspectZipCentralDirectory(buffer)

    for (const name of entries) {
        if (name.includes('..') || name.startsWith('/') || name.startsWith('\\')) {
            throw new Error('Archive contains unsafe path traversal entry.')
        }
        if (VBA_ENTRY_REGEX.test(name)) {
            throw new Error('Macro-enabled / VBA project content is rejected inside Office files.')
        }
        if (DANGEROUS_ZIP_EXTS.test(name)) {
            throw new Error(`Dangerous embedded entry '${name}' rejected.`)
        }
    }

    const expectedPrefix = ext === 'xlsx' ? 'xl/' : ext === 'docx' ? 'word/' : 'ppt/'
    const hasContentTypes = entries.includes('[Content_Types].xml')
    const hasExpectedDir = entries.some((e) => e.startsWith(expectedPrefix))
    if (!hasContentTypes && !hasExpectedDir) {
        throw new Error(`Archive does not appear to be a valid .${ext} document.`)
    }

    return { verifiedSignature: true, entryCount }
}

/**
 * Verifies actual file signature and content against the declared extension.
 * Throws a 400-tagged Error if disguised, macro-enabled, or invalid.
 */
export function inspectFileBuffer(buffer, ext) {
    try {
        if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
            throw new Error('Empty file buffer.')
        }

        switch (ext) {
            case 'png': {
                if (buffer.length < 8 || !buffer.subarray(0, 8).equals(PNG_MAGIC)) {
                    throw new Error('File signature does not match PNG image.')
                }
                return { verifiedSignature: true }
            }
            case 'jpg':
            case 'jpeg': {
                if (buffer.length < 3 || buffer[0] !== 0xFF || buffer[1] !== 0xD8 || buffer[2] !== 0xFF) {
                    throw new Error('File signature does not match JPEG image.')
                }
                return { verifiedSignature: true }
            }
            case 'webp': {
                if (
                    buffer.length < 12 ||
                    buffer.subarray(0, 4).toString('ascii') !== 'RIFF' ||
                    buffer.subarray(8, 12).toString('ascii') !== 'WEBP'
                ) {
                    throw new Error('File signature does not match WEBP image.')
                }
                return { verifiedSignature: true }
            }
            case 'pdf': {
                const headStr = buffer.subarray(0, Math.min(1024, buffer.length)).toString('ascii')
                if (!headStr.includes('%PDF-')) {
                    throw new Error('File signature does not match PDF document.')
                }
                return { verifiedSignature: true }
            }
            case 'doc':
            case 'xls':
            case 'ppt': {
                if (buffer.length < 8 || !buffer.subarray(0, 8).equals(OLE2_MAGIC)) {
                    throw new Error(`File signature does not match legacy Office '.${ext}' binary format.`)
                }
                return { verifiedSignature: true }
            }
            case 'xlsx':
            case 'docx':
            case 'pptx': {
                return verifyOoxmlBuffer(buffer, ext)
            }
            case 'csv': {
                // Reject binary/executable/markup disguised as CSV
                if (buffer.length >= 2 && buffer[0] === 0x4D && buffer[1] === 0x5A) {
                    throw new Error('Executable MZ header disguised as CSV.')
                }
                if (buffer.length >= 4 && buffer.subarray(0, 4).toString('ascii') === '%PDF') {
                    throw new Error('PDF file disguised as CSV.')
                }
                if (buffer.length >= 4 && buffer.readUInt32LE(0) === 0x04034b50) {
                    throw new Error('ZIP archive disguised as CSV.')
                }
                if (buffer.includes(0x00)) {
                    throw new Error('Binary null bytes detected in CSV file.')
                }
                const sample = buffer.subarray(0, Math.min(2048, buffer.length)).toString('utf8').trimStart()
                if (/^<(svg|html|!doctype|script|xml)\b/i.test(sample)) {
                    throw new Error('HTML/SVG/XML markup disguised as CSV is rejected.')
                }
                return { verifiedSignature: true }
            }
            default:
                throw new Error(`Unsupported file extension '.${ext}'.`)
        }
    } catch (err) {
        err.cause = { status: 400 }
        throw err
    }
}
