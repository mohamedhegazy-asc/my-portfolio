import { MAX_UPLOAD_MB, MAX_UPLOAD_BYTES } from '../../../config/config.service.js'

/**
 * Single server-side source of truth for allowed file types, MIME types,
 * kinds, size limits, and preview modes.
 */
export const FILE_TYPE_REGISTRY = {
    xlsx: {
        kind: 'xlsx',
        mimes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/octet-stream'],
        previewMode: 'excel',
        isLegacy: false,
        category: 'spreadsheet'
    },
    xls: {
        kind: 'xls',
        mimes: ['application/vnd.ms-excel', 'application/octet-stream'],
        previewMode: 'download-only',
        isLegacy: true,
        category: 'spreadsheet'
    },
    csv: {
        kind: 'csv',
        mimes: ['text/csv', 'application/csv', 'text/plain', 'application/vnd.ms-excel'],
        previewMode: 'excel',
        isLegacy: false,
        category: 'spreadsheet'
    },
    docx: {
        kind: 'docx',
        mimes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/octet-stream'],
        previewMode: 'download-only',
        isLegacy: false,
        category: 'document'
    },
    doc: {
        kind: 'doc',
        mimes: ['application/msword', 'application/octet-stream'],
        previewMode: 'download-only',
        isLegacy: true,
        category: 'document'
    },
    pptx: {
        kind: 'pptx',
        mimes: ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/octet-stream'],
        previewMode: 'download-only',
        isLegacy: false,
        category: 'presentation'
    },
    ppt: {
        kind: 'ppt',
        mimes: ['application/vnd.ms-powerpoint', 'application/octet-stream'],
        previewMode: 'download-only',
        isLegacy: true,
        category: 'presentation'
    },
    pdf: {
        kind: 'pdf',
        mimes: ['application/pdf'],
        previewMode: 'pdf',
        isLegacy: false,
        category: 'pdf'
    },
    png: {
        kind: 'image',
        mimes: ['image/png'],
        previewMode: 'image',
        isLegacy: false,
        category: 'image'
    },
    jpg: {
        kind: 'image',
        mimes: ['image/jpeg'],
        previewMode: 'image',
        isLegacy: false,
        category: 'image'
    },
    jpeg: {
        kind: 'image',
        mimes: ['image/jpeg'],
        previewMode: 'image',
        isLegacy: false,
        category: 'image'
    },
    webp: {
        kind: 'image',
        mimes: ['image/webp'],
        previewMode: 'image',
        isLegacy: false,
        category: 'image'
    }
}

export const FORBIDDEN_EXTENSIONS = new Set([
    'xlsm', 'xlsb', 'xltm', 'xlam',
    'docm', 'dotm', 'pptm', 'potm', 'ppsm', 'ppam',
    'exe', 'bat', 'cmd', 'com', 'scr', 'pif', 'sh', 'ps1', 'msi', 'dll', 'vbs', 'vbe', 'wsf',
    'js', 'mjs', 'cjs', 'ts', 'jsx', 'tsx',
    'html', 'htm', 'xhtml', 'svg', 'svgz', 'xml', 'php', 'py', 'rb', 'jar', 'apk'
])

export const ALLOWED_EXTENSIONS = Object.keys(FILE_TYPE_REGISTRY)
export const ALLOWED_MIME_TYPES = Array.from(
    new Set(Object.values(FILE_TYPE_REGISTRY).flatMap((t) => t.mimes))
)

export const ASSET_KINDS = Array.from(
    new Set([...Object.values(FILE_TYPE_REGISTRY).map((t) => t.kind), 'other'])
)

export const PREVIEW_MODES = ['excel', 'word', 'slides', 'pdf', 'image', 'download-only']

export function getPublicUploadConfig() {
    return {
        maxUploadMb: MAX_UPLOAD_MB,
        maxUploadBytes: MAX_UPLOAD_BYTES,
        allowedExtensions: ALLOWED_EXTENSIONS,
        allowedMimeTypes: ALLOWED_MIME_TYPES,
        legacyExtensions: ALLOWED_EXTENSIONS.filter((ext) => FILE_TYPE_REGISTRY[ext].isLegacy),
        types: Object.fromEntries(
            Object.entries(FILE_TYPE_REGISTRY).map(([ext, cfg]) => [
                ext,
                { kind: cfg.kind, previewMode: cfg.previewMode, isLegacy: cfg.isLegacy, category: cfg.category }
            ])
        )
    }
}
