export interface LocationGroup {
    region: string;
    locations: string[];
}

export const GLOBAL_LOCATIONS: LocationGroup[] = [
    {
        region: 'Asia Pacific',
        locations: [
            'Malaysia',
            'Singapore',
            'Indonesia',
            'Thailand',
            'Vietnam',
            'Philippines',
            'China',
            'Taiwan (China)',
            'Hong Kong SAR',
            'Japan',
            'South Korea',
            'India',
            'Australia',
            'New Zealand'
        ]
    },
    {
        region: 'Americas',
        locations: [
            'United States',
            'Canada',
            'Mexico',
            'Brazil',
            'Argentina',
            'Colombia'
        ]
    },
    {
        region: 'Europe',
        locations: [
            'United Kingdom',
            'Germany',
            'France',
            'Italy',
            'Spain',
            'Netherlands',
            'Poland',
            'Sweden'
        ]
    },
    {
        region: 'Middle East & Africa',
        locations: [
            'United Arab Emirates',
            'Saudi Arabia',
            'South Africa',
            'Nigeria',
            'Egypt',
            'Turkey'
        ]
    }
];

export const OTHER_LOCATION = 'Other Location';

export const CURRENCIES = [
    'MYR', 'USD', 'EUR', 'GBP', 'SGD', 'AUD', 'JPY', 'CNY', 'IDR', 'THB', 'VND', 'PHP', 'INR'
];
