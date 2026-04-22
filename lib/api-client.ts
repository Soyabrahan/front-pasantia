// Definimos la prioridad de las URLs
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL_REMOTE ||
    process.env.NEXT_PUBLIC_API_URL_LOCAL ||
    "http://localhost:3001";

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

export async function apiRequest<T>(
    endpoint: string,
    { params, ...options }: RequestOptions = {}
): Promise<T> {
    const url = new URL(`${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url.toString(), {
        cache: 'no-store',
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorData: any = {};
        try {
            errorData = await response.json();
        } catch (e) {
            // No JSON body
        }

        if (response.status === 401) {
            console.warn("Error de autenticación: El token ha expirado o no es válido.");
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
                window.location.href = '/login';
            }
        }
        
        const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
        console.error(`[API Error] ${options.method || 'GET'} ${endpoint} - ${errorMessage}`, errorData);
        throw new Error(errorMessage);
    }

    return response.json();
}

export const api = {
    get: <T>(endpoint: string, params?: Record<string, string>) =>
        apiRequest<T>(endpoint, { method: 'GET', params }),
    post: <T>(endpoint: string, body: any) =>
        apiRequest<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    patch: <T>(endpoint: string, body: any) =>
        apiRequest<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: <T>(endpoint: string) =>
        apiRequest<T>(endpoint, { method: 'DELETE' }),
};
