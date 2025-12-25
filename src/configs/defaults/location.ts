const location = {
  stateCode: 'ON',
  state: 'Ontario',
  city: 'Toronto',
  // HOME PAGE STATS
  defaultFilters: {},
  // DASHBOARD LIST
  defaultCities: [
    'Algoma',
    'Toronto', // 750+
    'Mississauga', // 80+
    'Brampton', // 90+
    'Vaughan', // 90+
    'Ottawa', // 30+

    'Markham', // 80+
    'Oakville', // 80+
    // 'Scarborough', // 70+
    'Kitchener', // 70+
    'Burlington', // 60+

  ]
}

export const citymap = {
  Algoma: {
    active: true,
    items: {
      'Algoma Remote Area': { active: false },
      'Blind River': { active: false },
      'Elliot Lake': { active: false },
      Hornepayne: { active: false },
      'Huron Shores': { active: false },
      Laird: { active: false },
      'Sault Ste Marie': { active: false },
      'St. Joseph': { active: false },
      Thessalon: { active: false },
      Wawa: { active: false }
    }
  },

  Brant: {
    active: true,
    items: {
      Brant: { active: false },
      Brantford: { active: true }
    }
  },

  Bruce: {
    active: false,
    items: {
      'Arran-Elderslie': { active: false },
      Brockton: { active: false },
      'First Nations': { active: false },
      'Huron-Kinloss': { active: false },
      Kincardine: { active: false },
      'Native Leased Lands': { active: false },
      'Northern Bruce Peninsula': { active: false },
      'Saugeen Shores': { active: false },
      'South Bruce': { active: false },
      'South Bruce Peninsula': { active: false }
    }
  },

  Durham: {
    active: false,
    items: {
      Ajax: { active: false },
      Brock: { active: false },
      Clarington: { active: false },
      Oshawa: { active: false },
      Pickering: { active: false },
      Uxbridge: { active: false },
      Whitby: { active: false }
    }
  },

  Halton: {
    active: false,
    items: {
      Burlington: { active: false },
      'Halton Hills': { active: false },
      Milton: { active: false },
      Oakville: { active: false }
    }
  },

  Peel: {
    active: false,
    items: {
      Brampton: { active: false },
      Caledon: { active: false },
      Mississauga: { active: false }
    }
  },

  Toronto: {
    active: true,
    items: {
      Toronto: { active: true }
    }
  },

  York: {
    active: true,
    items: {
      Aurora: { active: false },
      'East Gwillimbury': { active: false },
      Georgina: { active: false },
      King: { active: false },
      Markham: { active: false },
      'Richmond Hill': { active: false },
      Vaughan: { active: true },
      'Whitchurch-Stouffville': { active: false }
    }
  }
}

export default location
