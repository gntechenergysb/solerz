export interface LocationGroup {
    region: string;
    locations: string[];
}

export const GLOBAL_LOCATIONS: LocationGroup[] = [
    {
        region: 'Regional Markets',
        locations: [
            'Australia',
            'China',
            'Indonesia',
            'Malaysia',
            'Myanmar',
            'Philippines',
            'Singapore',
            'Thailand',
            'Vietnam'
        ]
    }
];

export const OTHER_LOCATION = 'Other Location';

export const CURRENCIES = [
    'MYR', 'USD', 'EUR', 'GBP', 'SGD', 'AUD', 'JPY', 'CNY', 'IDR', 'THB', 'VND', 'PHP', 'INR'
];
