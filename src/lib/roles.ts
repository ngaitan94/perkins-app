import type { Profile, UserRole } from './types';

export function hasRole(profile: Profile | null | undefined, role: UserRole): boolean {
	return profile?.roles?.includes(role) ?? false;
}

export function isAdmin(profile: Profile | null | undefined): boolean {
	return hasRole(profile, 'admin');
}

export function isPremiumPerkin(profile: Profile | null | undefined): boolean {
	return profile?.subscription_tier === 'premium_perkin';
}

export function isPremiumRequester(profile: Profile | null | undefined): boolean {
	return profile?.subscription_tier === 'premium_requester';
}

export function getDefaultDashboard(profile: Profile | null | undefined): string {
	if (!profile) return '/login';
	if (hasRole(profile, 'admin')) return '/admin';
	if (hasRole(profile, 'requester')) return '/app/solicitudes';
	if (hasRole(profile, 'perkin')) return '/app/perkin';
	return '/app/perfil';
}

export const STATUS_LABELS: Record<string, string> = {
	draft: 'Borrador',
	open: 'Abierta',
	assigned: 'Asignada',
	in_progress: 'En progreso',
	completed: 'Completada',
	cancelled: 'Cancelada',
	disputed: 'En disputa',
};

export const STATUS_COLORS: Record<string, string> = {
	draft: '#64748b',
	open: '#059669',
	assigned: '#2563eb',
	in_progress: '#d97706',
	completed: '#16a34a',
	cancelled: '#94a3b8',
	disputed: '#dc2626',
};
