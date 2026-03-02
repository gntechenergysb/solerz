export interface LocationGroup {
    region: string;
    locations: string[];
}

export const GLOBAL_LOCATIONS: LocationGroup[] = [
    {
        region: 'Asia Pacific',
        // Priority sorted by solar manufacturing & market scale
        locations: [
            'China',
            'Vietnam',
            'Malaysia',
            'India',
            'Thailand',
            'South Korea',
            'Japan',
            'Taiwan (China)',
            'Indonesia',
            'Philippines',
            'Australia',
            'Singapore',
            'New Zealand',
            'Hong Kong SAR'
        ]
    },
    {
        // "Americas" is the standard UN/business term for North, Central & South America combined
        region: 'Americas',
        // Sorted by manufacturing capacity & assembly hubs
        locations: [
            'United States',
            'Mexico',
            'Brazil',
            'Canada',
            'Argentina',
            'Colombia'
        ]
    },
    {
        region: 'Europe',
        // Sorted by PV manufacturing (modules/inverters/trackers)
        locations: [
            'Germany',
            'Spain',
            'Italy',
            'France',
            'Poland',
            'Netherlands',
            'United Kingdom',
            'Sweden'
        ]
    },
    {
        region: 'Middle East & Africa',
        // Sorted by PV assembly & production scale
        locations: [
            'Turkey',
            'United Arab Emirates',
            'Saudi Arabia',
            'Egypt',
            'South Africa',
            'Nigeria'
        ]
    }
];

export const OTHER_LOCATION = 'Other Location';

export const CURRENCIES = [
    'MYR', 'USD', 'EUR', 'GBP', 'SGD', 'AUD', 'JPY', 'CNY', 'IDR', 'THB', 'VND', 'PHP', 'INR'
];
