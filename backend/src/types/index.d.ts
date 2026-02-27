export interface Admin {
    id: string;
    email: string;
    full_name?: string;
    role: "super_admin" | "admin_offers" | "admin_users";
    is_blocked?: boolean;
}
export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    sector: string;
    description?: string;
    salary?: string;
    published: boolean;
    created_at: string;
}
//# sourceMappingURL=index.d.ts.map