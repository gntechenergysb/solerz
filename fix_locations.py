import re

# Update Marketplace.tsx
with open('e:/GitHub/solerz/pages/Marketplace.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace 'All Countries' string references (both comparisons and display)
content = content.replace("'All Countries'", "'All Stock Locations'")
content = content.replace('>All Countries<', '>All Stock Locations<')

# Update import to also include STOCK_LOCATIONS
content = content.replace(
    "import { GLOBAL_LOCATIONS } from '../utils/countries';",
    "import { STOCK_LOCATIONS } from '../utils/countries';"
)

# Replace GLOBAL_LOCATIONS with STOCK_LOCATIONS in the dropdown
content = content.replace('GLOBAL_LOCATIONS.map', 'STOCK_LOCATIONS.map')

with open('e:/GitHub/solerz/pages/Marketplace.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated Marketplace.tsx')

# Update CreateListing.tsx
with open('e:/GitHub/solerz/pages/CreateListing.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("'All Countries'", "'All Stock Locations'")
content = content.replace('>All Countries<', '>All Stock Locations<')
content = content.replace(
    "import { GLOBAL_LOCATIONS, CURRENCIES } from '../utils/countries';",
    "import { STOCK_LOCATIONS, CURRENCIES } from '../utils/countries';"
)
content = content.replace('GLOBAL_LOCATIONS.map', 'STOCK_LOCATIONS.map')

with open('e:/GitHub/solerz/pages/CreateListing.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated CreateListing.tsx')

# Update Dashboard.tsx
with open('e:/GitHub/solerz/pages/Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("'All Countries'", "'All Stock Locations'")
content = content.replace('>All Countries<', '>All Stock Locations<')
content = content.replace(
    "import { GLOBAL_LOCATIONS } from '../utils/countries';",
    "import { STOCK_LOCATIONS } from '../utils/countries';"
)
content = content.replace('GLOBAL_LOCATIONS.map', 'STOCK_LOCATIONS.map')

with open('e:/GitHub/solerz/pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated Dashboard.tsx')
