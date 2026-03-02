export interface GeoLocation {
    country_name: string;
    country_code: string;
    currency: string;
}

export const detectUserLocation = async (): Promise<GeoLocation | null> => {
    try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) return null;
        const data = await response.json();
        return {
            country_name: data.country_name,
            country_code: data.country_code,
            currency: data.currency
        };
    } catch (error) {
        console.warn('Geo-IP detection failed (likely rate-limited), defaulting to fallback location.');
        return null;
    }
};
