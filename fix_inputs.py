import re

with open('e:/GitHub/solerz/pages/CreateListing.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

def replace_input(m):
    full_tag = m.group(0)
    match_key = re.search(r"handleSpecChange\('([^']+)'", full_tag)
    if not match_key:
        return full_tag
    key = match_key.group(1)
    
    # We want to insert value={(specs as any).key ?? ''} if not already present
    if 'value=' not in full_tag:
        full_tag = full_tag.replace('onChange=', f'value={{(specs as any).{key} ?? \'\'}} onChange=')
        
    if 'brand' in key.lower() and 'list=' not in full_tag:
        full_tag = full_tag.replace('/>', 'list="user-brands" />')
        
    return full_tag

lines = content.split('\n')
count = 0
for i, line in enumerate(lines):
    if '<Input' in line and 'handleSpecChange' in line:
        new_line = re.sub(r'<Input.*?/>', replace_input, line)
        if new_line != line:
            lines[i] = new_line
            count += 1

# Also fix standalone <select>s
def replace_select(m):
    full_tag = m.group(0)
    if 'value=' in full_tag: return full_tag
    match_key = re.search(r"handleSpecChange\('([^']+)'", full_tag)
    if not match_key: return full_tag
    key = match_key.group(1)
    # inject value right inside <select
    full_tag = full_tag.replace('<select', f'<select value={{String((specs as any).{key} || \'\')}}')
    return full_tag

for i, line in enumerate(lines):
    if '<select' in line and 'handleSpecChange' in line:
        new_line = re.sub(r'<select[^>]+>', replace_select, line)
        if new_line != line:
            lines[i] = new_line
            count += 1

print('Total replacements:', count)

with open('e:/GitHub/solerz/pages/CreateListing.tsx', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
