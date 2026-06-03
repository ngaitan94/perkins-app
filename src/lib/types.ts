export type UserRole = 'requester' | 'perkin' | 'admin';
export type SubscriptionTier = 'free' | 'premium_requester' | 'premium_perkin';
export type SolicitudStatus =
	| 'draft'
	| 'open'
	| 'assigned'
	| 'in_progress'
	| 'completed'
	| 'cancelled'
	| 'disputed';
export type PaymentStatus = 'pending' | 'approved' | 'released' | 'refunded';
export type Visibility = 'standard' | 'premium_only';

export interface Profile {
	id: string;
	display_name: string | null;
	phone: string | null;
	avatar_url: string | null;
	roles: UserRole[];
	subscription_tier: SubscriptionTier;
	mp_seller_id: string | null;
	mp_connected: boolean;
	comuna: string | null;
	region: string | null;
	perkin_verified: boolean;
	rating_avg: number;
	completed_count: number;
	created_at: string;
}

export interface Category {
	id: string;
	slug: string;
	name: string;
	icon: string;
}

export interface Solicitud {
	id: string;
	requester_id: string;
	category_id: string;
	title: string;
	description: string;
	address_text: string | null;
	comuna: string;
	lat: number | null;
	lng: number | null;
	amount_clp: number;
	platform_fee_clp: number;
	total_clp: number;
	visibility: Visibility;
	status: SolicitudStatus;
	assigned_perkin_id: string | null;
	deadline_at: string | null;
	published_at: string | null;
	created_at: string;
	updated_at: string;
	categories?: Category;
	profiles?: Pick<Profile, 'display_name' | 'rating_avg' | 'perkin_verified'>;
}

export interface SubscriptionPlan {
	id: string;
	slug: string;
	name: string;
	price_clp: number;
	billing_period: string;
	target_role: 'requester' | 'perkin';
	benefits: string[];
	mp_plan_id: string | null;
	active: boolean;
}

export interface Payment {
	id: string;
	solicitud_id: string;
	payer_id: string;
	payee_id: string | null;
	mp_payment_id: string | null;
	mp_preference_id: string | null;
	amount_clp: number;
	marketplace_fee_clp: number;
	status: PaymentStatus;
	created_at: string;
}

export interface SolicitudMessage {
	id: string;
	solicitud_id: string;
	sender_id: string;
	body: string;
	created_at: string;
}
