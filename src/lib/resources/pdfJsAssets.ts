import { resolveAssetUrl } from '$lib/resources/asset-url';
import moduleSrc from 'pdfjs-dist/build/pdf.mjs?url';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

type PdfJsSupportDirectory = 'cmaps' | 'iccs' | 'image_decoders' | 'standard_fonts' | 'wasm';

const toSupportDirectoryUrl = (directory: PdfJsSupportDirectory): string => {
	const path = `/pdfjs/${directory}`;
	return `${resolveAssetUrl(path).replace(/\/$/, '')}/`;
};

export const pdfJsAssetUrls = Object.freeze({
	moduleSrc,
	workerSrc,
	cMapUrl: toSupportDirectoryUrl('cmaps'),
	iccUrl: toSupportDirectoryUrl('iccs'),
	imageDecoderUrl: toSupportDirectoryUrl('image_decoders'),
	standardFontDataUrl: toSupportDirectoryUrl('standard_fonts'),
	wasmUrl: toSupportDirectoryUrl('wasm')
});
