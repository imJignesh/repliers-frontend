const slugs = [
  'madison-avenue-lofts-380-macpherson-ave',
  'feather-factory-lofts-2154-dundas-st-w',
  'boiler-factory-lofts-189-queen-st-e',
  'i-zone-live-worklofts-326-carlaw-ave-1159-1173-dundas-st-e',
  'st-lawrence-market-lofts-81a-front-st-e',
  'butterick-building-468-wellington-st-w',
  'brewery-lofts-90-sumach-st',
  'the-knitting-mill-lofts-426-queen-st-e',
  'wrigley-lofts-245-carlaw-ave',
  'evening-telegram-lofts-264-seaton-st',
  'sorauren-lofts-347-sorauren-ave',
  'the-argyle-lofts-183-dovercourt-rd',
  'the-candy-factory-lofts-993-queen-st-w',
  'the-merchandise-lofts-155-dalhousie-st',
  'the-abbey-lofts-384-sunnyside-ave',
  'stockyard-lofts-121-prescott-ave',
  'west-40-40-westmoreland-ave',
  'vu-north-tower-116-george-st',
  'glass-house-lofts-127-queen-st-e',
  'edge-lofts-625-queen-st-e',
  'fashion-district-lofts-10-morrison-st',
  'dna-north-tower-1005-king-st-w',
  'academy-lane-lofts-1852-queen-st-e',
  'king-west-village-lofts-954-king-st-w',
  'quad-lofts-23-brant-st',
  'abbey-lane-lofts-261-king-st-e',
  'riverside-court-3077-weston-rd',
  '75-portland-75-portland-st',
  '500-wellington-west-500-wellington-st-w',
  '2g-2-gladstone-ave',
  'east-lofts-138-princess-st',
  'work-lofts-319-carlaw-ave',
  'flatiron-lofts-1201-dundas-st-e',
  'liberty-market-lofts-5-hanna-ave'
];

const parseSlug = (slugStr) => {
  const listingName = slugStr;
  const slugs = listingName.split('-');
  const boardId = 1;

  const realSuffixes = [
    'st', 'street', 'ave', 'avenue', 'rd', 'road', 'blvd', 'boulevard', 'dr', 'drive',
    'crt', 'court', 'pl', 'place', 'ln', 'lane', 'way', 'cir', 'circle', 'cres', 'crescent',
    'ter', 'terrace', 'hwy', 'highway', 'sq', 'square', 'est', 'estate', 'quay', 'path',
    'gate', 'mews', 'grove', 'row', 'gdns', 'gardens', 'pky', 'parkway', 'esplanade', 'walk', 'trail'
  ];

  const directions = ['n', 's', 'e', 'w', 'north', 'south', 'east', 'west'];

  let streetNumber = '';
  let streetName = '';
  let streetSuffix = '';
  let streetDirection = '';

  const candidates = [];
  for (let i = 0; i < slugs.length; i++) {
    if (/^\d+[a-z]*([-\/]\d+[a-z]*)?$/i.test(slugs[i])) {
      for (let j = i + 1; j < slugs.length; j++) {
        const potentialSuffix = slugs[j].toLowerCase();
        if (realSuffixes.includes(potentialSuffix)) {
          const numStr = slugs[i];
          const nameParts = slugs.slice(i + 1, j);
          
          const hasInnerNumber = nameParts.some(part => /^\d+$/.test(part));

          if (nameParts.length > 0 && !hasInnerNumber) {
            let sDir = '';
            const nextPart = slugs[j + 1]?.toLowerCase();
            if (nextPart && directions.includes(nextPart)) {
              sDir = nextPart;
            }

            candidates.push({
              streetNumber: numStr,
              streetName: nameParts.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
              streetSuffix: slugs[j],
              streetDirection: sDir,
              index: i
            });
          }
        }
      }
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => b.index - a.index);
    return candidates[0];
  } else {
    return { error: 'No candidate found' };
  }
};

slugs.forEach(slug => {
  console.log(slug + ' => ' + JSON.stringify(parseSlug(slug)));
});
