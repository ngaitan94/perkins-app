export function parseAmountInput(value: string): number | null {
	const s = String(value).trim().replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
	if (!s) return null;
	const n = Number.parseFloat(s);
	if (!Number.isFinite(n) || n <= 0) return null;
	return Math.round(n);
}

export function formatCLP(amount: number): string {
	return new Intl.NumberFormat('es-CL', {
		style: 'currency',
		currency: 'CLP',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
}

export function calcPlatformFee(amountClp: number, feePercent = 12): number {
	return Math.round(amountClp * (feePercent / 100));
}

export function calcTotal(amountClp: number, feePercent = 12): number {
	return amountClp + calcPlatformFee(amountClp, feePercent);
}

export function getFeePercent(): number {
	const raw = import.meta.env.PLATFORM_FEE_PERCENT;
	const n = Number.parseInt(String(raw ?? '12'), 10);
	return Number.isFinite(n) && n >= 0 && n <= 50 ? n : 12;
}
