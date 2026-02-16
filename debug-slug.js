
const realSuffixes = [
    'st', 'street', 'ave', 'avenue', 'rd', 'road', 'blvd', 'boulevard', 'dr', 'drive',
    'crt', 'court', 'pl', 'place', 'ln', 'lane', 'way', 'cir', 'circle', 'cres', 'crescent',
    'ter', 'terrace', 'hwy', 'highway', 'sq', 'square', 'est', 'estate', 'quay', 'path',
    'gate', 'mews', 'grove', 'row', 'gdns', 'gardens', 'pky', 'parkway', 'esplanade', 'walk', 'trail'
];
const directions = ['n', 's', 'e', 'w', 'north', 'south', 'east', 'west'];

function parseSlug(listingName) {
    const slugs = listingName.split('-');
    let streetNumber = '';
    let streetName = '';
    let streetSuffix = '';
    let streetDirection = '';

    for (let i = 0; i < slugs.length; i++) {
        if (/^\d+[a-z]*([-\/]\d+[a-z]*)?$/i.test(slugs[i])) {
            for (let j = i + 1; j < slugs.length; j++) {
                const potentialSuffix = slugs[j].toLowerCase();
                if (realSuffixes.includes(potentialSuffix)) {
                    const numStr = slugs[i];
                    const nameParts = slugs.slice(i + 1, j);
                    if (nameParts.length > 0) {
                        streetNumber = numStr;
                        streetName = nameParts.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
                        streetSuffix = slugs[j];
                        const nextPart = slugs[j + 1]?.toLowerCase();
                        if (nextPart && directions.includes(nextPart)) streetDirection = nextPart;
                        return { streetNumber, streetName, streetSuffix, streetDirection };
                    }
                }
            }
        }
    }
    return { error: 'pattern not matched' };
}

console.log(JSON.stringify(parseSlug('brewery-lofts-90-sumach-st')));
