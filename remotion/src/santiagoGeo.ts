export const GEO_BOUNDS = {
	minLat: -33.62,
	maxLat: -33.34,
	minLng: -70.78,
	maxLng: -70.5,
} as const;

export const COMUNA_COORDS: Record<string, { lat: number; lng: number }> = {
	Santiago: { lat: -33.4489, lng: -70.6693 },
	Providencia: { lat: -33.4372, lng: -70.6506 },
	'Las Condes': { lat: -33.4089, lng: -70.5675 },
	Ñuñoa: { lat: -33.4569, lng: -70.5975 },
	Maipú: { lat: -33.5117, lng: -70.7606 },
	'La Florida': { lat: -33.5225, lng: -70.5958 },
	'Puente Alto': { lat: -33.6117, lng: -70.5758 },
	'San Bernardo': { lat: -33.5925, lng: -70.6997 },
	Peñalolén: { lat: -33.4892, lng: -70.5469 },
	'La Reina': { lat: -33.4517, lng: -70.5356 },
	Vitacura: { lat: -33.3875, lng: -70.5694 },
	'Lo Barnechea': { lat: -33.35, lng: -70.5167 },
	Macul: { lat: -33.4892, lng: -70.5975 },
	'San Miguel': { lat: -33.4975, lng: -70.6497 },
	Independencia: { lat: -33.4194, lng: -70.6611 },
	Recoleta: { lat: -33.4056, lng: -70.6361 },
	'Estación Central': { lat: -33.4517, lng: -70.6806 },
	Quilicura: { lat: -33.3667, lng: -70.7333 },
	Huechuraba: { lat: -33.3667, lng: -70.6333 },
	Conchalí: { lat: -33.3833, lng: -70.675 },
};

export function project(
	lat: number,
	lng: number,
	width: number,
	height: number,
	padding = 48,
): { x: number; y: number } {
	const innerW = width - padding * 2;
	const innerH = height - padding * 2;
	const x =
		padding +
		((lng - GEO_BOUNDS.minLng) / (GEO_BOUNDS.maxLng - GEO_BOUNDS.minLng)) *
			innerW;
	const y =
		padding +
		((GEO_BOUNDS.maxLat - lat) / (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat)) *
			innerH;
	return { x, y };
}

export function comunaPoint(
	comuna: string,
	width: number,
	height: number,
): { x: number; y: number } {
	const coords = COMUNA_COORDS[comuna] ?? COMUNA_COORDS.Santiago;
	return project(coords.lat, coords.lng, width, height);
}

/** Contorno estilizado del valle de Santiago (viewBox 0 0 720 720). */
export const SANTIAGO_OUTLINE =
	'M 88 520 C 95 420 120 340 180 280 C 240 220 320 180 400 165 C 480 150 560 175 610 230 C 650 275 665 340 655 410 C 645 480 600 540 530 575 C 460 610 360 625 260 610 C 180 598 110 565 88 520 Z';

export const MAPOCHO_RIVER =
	'M 140 380 C 220 360 300 350 380 345 C 460 340 540 355 600 390';

export const ANDES_SILHOUETTE =
	'M 520 720 L 545 580 L 575 480 L 610 400 L 640 320 L 665 260 L 685 200 L 700 140 L 720 80 L 720 720 Z';
