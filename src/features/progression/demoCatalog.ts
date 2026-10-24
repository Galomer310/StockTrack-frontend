/* ===========================================================================
   Demo copy of the progression catalog, for /player?demo only.
   ---------------------------------------------------------------------------
   A copy of StockTracker-backend src/progression/catalog.json as of
   2026-10-24, reshaped to the API's field names. Live screens never read
   this - they get titles and achievements from the server - so if the
   catalog changes, only the demo drifts until this is updated.
   =========================================================================== */

export const DEMO_TITLES = [
  {
    "id": "junior_analyst",
    "name": "Junior Analyst",
    "category": "professional_path",
    "source_type": "level",
    "required_level": 1,
    "tier": 1,
    "icon": "mortarboard",
    "accent_color": "#9DBDE7",
    "sort_order": 10,
    "rarity": null
  },
  {
    "id": "chart_rookie",
    "name": "Chart Rookie",
    "category": "market_legends",
    "source_type": "level",
    "required_level": 1,
    "tier": 1,
    "icon": "flame",
    "accent_color": "#DAA17F",
    "sort_order": 11,
    "rarity": null
  },
  {
    "id": "capital_apprentice",
    "name": "Capital Apprentice",
    "category": "capital_empire",
    "source_type": "level",
    "required_level": 1,
    "tier": 1,
    "icon": "crown",
    "accent_color": "#E4CC91",
    "sort_order": 12,
    "rarity": null
  },
  {
    "id": "research_associate",
    "name": "Research Associate",
    "category": "professional_path",
    "source_type": "level",
    "required_level": 6,
    "tier": 2,
    "icon": "mortarboard",
    "accent_color": "#9DBDE7",
    "sort_order": 20,
    "rarity": null
  },
  {
    "id": "trend_scout",
    "name": "Trend Scout",
    "category": "market_legends",
    "source_type": "level",
    "required_level": 6,
    "tier": 2,
    "icon": "flame",
    "accent_color": "#DAA17F",
    "sort_order": 21,
    "rarity": null
  },
  {
    "id": "seed_investor",
    "name": "Seed Investor",
    "category": "capital_empire",
    "source_type": "level",
    "required_level": 6,
    "tier": 2,
    "icon": "crown",
    "accent_color": "#E4CC91",
    "sort_order": 22,
    "rarity": null
  },
  {
    "id": "equity_researcher",
    "name": "Equity Researcher",
    "category": "professional_path",
    "source_type": "level",
    "required_level": 11,
    "tier": 3,
    "icon": "mortarboard",
    "accent_color": "#9DBDE7",
    "sort_order": 30,
    "rarity": null
  },
  {
    "id": "signal_seeker",
    "name": "Signal Seeker",
    "category": "market_legends",
    "source_type": "level",
    "required_level": 11,
    "tier": 3,
    "icon": "flame",
    "accent_color": "#DAA17F",
    "sort_order": 31,
    "rarity": null
  },
  {
    "id": "asset_collector",
    "name": "Asset Collector",
    "category": "capital_empire",
    "source_type": "level",
    "required_level": 11,
    "tier": 3,
    "icon": "crown",
    "accent_color": "#E4CC91",
    "sort_order": 32,
    "rarity": null
  },
  {
    "id": "financial_modeler",
    "name": "Financial Modeler",
    "category": "professional_path",
    "source_type": "level",
    "required_level": 16,
    "tier": 4,
    "icon": "mortarboard",
    "accent_color": "#9DBDE7",
    "sort_order": 40,
    "rarity": null
  },
  {
    "id": "dip_hunter",
    "name": "Dip Hunter",
    "category": "market_legends",
    "source_type": "level",
    "required_level": 16,
    "tier": 4,
    "icon": "flame",
    "accent_color": "#DAA17F",
    "sort_order": 41,
    "rarity": null
  },
  {
    "id": "deal_maker",
    "name": "Deal Maker",
    "category": "capital_empire",
    "source_type": "level",
    "required_level": 16,
    "tier": 4,
    "icon": "crown",
    "accent_color": "#E4CC91",
    "sort_order": 42,
    "rarity": null
  },
  {
    "id": "valuation_specialist",
    "name": "Valuation Specialist",
    "category": "professional_path",
    "source_type": "level",
    "required_level": 21,
    "tier": 5,
    "icon": "mortarboard",
    "accent_color": "#9DBDE7",
    "sort_order": 50,
    "rarity": null
  },
  {
    "id": "breakout_artist",
    "name": "Breakout Artist",
    "category": "market_legends",
    "source_type": "level",
    "required_level": 21,
    "tier": 5,
    "icon": "flame",
    "accent_color": "#DAA17F",
    "sort_order": 51,
    "rarity": null
  },
  {
    "id": "equity_builder",
    "name": "Equity Builder",
    "category": "capital_empire",
    "source_type": "level",
    "required_level": 21,
    "tier": 5,
    "icon": "crown",
    "accent_color": "#E4CC91",
    "sort_order": 52,
    "rarity": null
  },
  {
    "id": "sector_expert",
    "name": "Sector Expert",
    "category": "professional_path",
    "source_type": "level",
    "required_level": 26,
    "tier": 6,
    "icon": "mortarboard",
    "accent_color": "#9DBDE7",
    "sort_order": 60,
    "rarity": null
  },
  {
    "id": "momentum_rider",
    "name": "Momentum Rider",
    "category": "market_legends",
    "source_type": "level",
    "required_level": 26,
    "tier": 6,
    "icon": "flame",
    "accent_color": "#DAA17F",
    "sort_order": 61,
    "rarity": null
  },
  {
    "id": "wealth_architect",
    "name": "Wealth Architect",
    "category": "capital_empire",
    "source_type": "level",
    "required_level": 26,
    "tier": 6,
    "icon": "crown",
    "accent_color": "#E4CC91",
    "sort_order": 62,
    "rarity": null
  },
  {
    "id": "senior_analyst",
    "name": "Senior Analyst",
    "category": "professional_path",
    "source_type": "level",
    "required_level": 31,
    "tier": 7,
    "icon": "mortarboard",
    "accent_color": "#9DBDE7",
    "sort_order": 70,
    "rarity": null
  },
  {
    "id": "pattern_breaker",
    "name": "Pattern Breaker",
    "category": "market_legends",
    "source_type": "level",
    "required_level": 31,
    "tier": 7,
    "icon": "flame",
    "accent_color": "#DAA17F",
    "sort_order": 71,
    "rarity": null
  },
  {
    "id": "fortune_seeker",
    "name": "Fortune Seeker",
    "category": "capital_empire",
    "source_type": "level",
    "required_level": 31,
    "tier": 7,
    "icon": "crown",
    "accent_color": "#E4CC91",
    "sort_order": 72,
    "rarity": null
  },
  {
    "id": "risk_strategist",
    "name": "Risk Strategist",
    "category": "professional_path",
    "source_type": "level",
    "required_level": 36,
    "tier": 8,
    "icon": "mortarboard",
    "accent_color": "#9DBDE7",
    "sort_order": 80,
    "rarity": null
  },
  {
    "id": "volatility_navigator",
    "name": "Volatility Navigator",
    "category": "market_legends",
    "source_type": "level",
    "required_level": 36,
    "tier": 8,
    "icon": "flame",
    "accent_color": "#DAA17F",
    "sort_order": 81,
    "rarity": null
  },
  {
    "id": "power_broker",
    "name": "Power Broker",
    "category": "capital_empire",
    "source_type": "level",
    "required_level": 36,
    "tier": 8,
    "icon": "crown",
    "accent_color": "#E4CC91",
    "sort_order": 82,
    "rarity": null
  },
  {
    "id": "portfolio_architect",
    "name": "Portfolio Architect",
    "category": "professional_path",
    "source_type": "level",
    "required_level": 41,
    "tier": 9,
    "icon": "mortarboard",
    "accent_color": "#9DBDE7",
    "sort_order": 90,
    "rarity": null
  },
  {
    "id": "risk_tactician",
    "name": "Risk Tactician",
    "category": "market_legends",
    "source_type": "level",
    "required_level": 41,
    "tier": 9,
    "icon": "flame",
    "accent_color": "#DAA17F",
    "sort_order": 91,
    "rarity": null
  },
  {
    "id": "fortune_maker",
    "name": "Fortune Maker",
    "category": "capital_empire",
    "source_type": "level",
    "required_level": 41,
    "tier": 9,
    "icon": "crown",
    "accent_color": "#E4CC91",
    "sort_order": 92,
    "rarity": null
  },
  {
    "id": "strategic_investor",
    "name": "Strategic Investor",
    "category": "professional_path",
    "source_type": "level",
    "required_level": 46,
    "tier": 10,
    "icon": "mortarboard",
    "accent_color": "#9DBDE7",
    "sort_order": 100,
    "rarity": null
  },
  {
    "id": "bull_whisperer",
    "name": "Bull Whisperer",
    "category": "market_legends",
    "source_type": "level",
    "required_level": 46,
    "tier": 10,
    "icon": "flame",
    "accent_color": "#DAA17F",
    "sort_order": 101,
    "rarity": null
  },
  {
    "id": "the_financier",
    "name": "The Financier",
    "category": "capital_empire",
    "source_type": "level",
    "required_level": 46,
    "tier": 10,
    "icon": "crown",
    "accent_color": "#E4CC91",
    "sort_order": 102,
    "rarity": null
  },
  {
    "id": "portfolio_manager",
    "name": "Portfolio Manager",
    "category": "professional_path",
    "source_type": "level",
    "required_level": 51,
    "tier": 11,
    "icon": "mortarboard",
    "accent_color": "#9DBDE7",
    "sort_order": 110,
    "rarity": null
  },
  {
    "id": "the_contrarian",
    "name": "The Contrarian",
    "category": "market_legends",
    "source_type": "level",
    "required_level": 51,
    "tier": 11,
    "icon": "flame",
    "accent_color": "#DAA17F",
    "sort_order": 111,
    "rarity": null
  },
  {
    "id": "empire_builder",
    "name": "Empire Builder",
    "category": "capital_empire",
    "source_type": "level",
    "required_level": 51,
    "tier": 11,
    "icon": "crown",
    "accent_color": "#E4CC91",
    "sort_order": 112,
    "rarity": null
  },
  {
    "id": "head_of_research",
    "name": "Head of Research",
    "category": "professional_path",
    "source_type": "level",
    "required_level": 56,
    "tier": 12,
    "icon": "mortarboard",
    "accent_color": "#9DBDE7",
    "sort_order": 120,
    "rarity": null
  },
  {
    "id": "alpha_hunter",
    "name": "Alpha Hunter",
    "category": "market_legends",
    "source_type": "level",
    "required_level": 56,
    "tier": 12,
    "icon": "flame",
    "accent_color": "#DAA17F",
    "sort_order": 121,
    "rarity": null
  },
  {
    "id": "the_rainmaker",
    "name": "The Rainmaker",
    "category": "capital_empire",
    "source_type": "level",
    "required_level": 56,
    "tier": 12,
    "icon": "crown",
    "accent_color": "#E4CC91",
    "sort_order": 122,
    "rarity": null
  },
  {
    "id": "fund_director",
    "name": "Fund Director",
    "category": "professional_path",
    "source_type": "level",
    "required_level": 61,
    "tier": 13,
    "icon": "mortarboard",
    "accent_color": "#9DBDE7",
    "sort_order": 130,
    "rarity": null
  },
  {
    "id": "price_alchemist",
    "name": "Price Alchemist",
    "category": "market_legends",
    "source_type": "level",
    "required_level": 61,
    "tier": 13,
    "icon": "flame",
    "accent_color": "#DAA17F",
    "sort_order": 131,
    "rarity": null
  },
  {
    "id": "the_magnate",
    "name": "The Magnate",
    "category": "capital_empire",
    "source_type": "level",
    "required_level": 61,
    "tier": 13,
    "icon": "crown",
    "accent_color": "#E4CC91",
    "sort_order": 132,
    "rarity": null
  },
  {
    "id": "investment_principal",
    "name": "Investment Principal",
    "category": "professional_path",
    "source_type": "level",
    "required_level": 66,
    "tier": 14,
    "icon": "mortarboard",
    "accent_color": "#9DBDE7",
    "sort_order": 140,
    "rarity": null
  },
  {
    "id": "the_dark_horse",
    "name": "The Dark Horse",
    "category": "market_legends",
    "source_type": "level",
    "required_level": 66,
    "tier": 14,
    "icon": "flame",
    "accent_color": "#DAA17F",
    "sort_order": 141,
    "rarity": null
  },
  {
    "id": "the_tycoon",
    "name": "The Tycoon",
    "category": "capital_empire",
    "source_type": "level",
    "required_level": 66,
    "tier": 14,
    "icon": "crown",
    "accent_color": "#E4CC91",
    "sort_order": 142,
    "rarity": null
  },
  {
    "id": "managing_partner",
    "name": "Managing Partner",
    "category": "professional_path",
    "source_type": "level",
    "required_level": 71,
    "tier": 15,
    "icon": "mortarboard",
    "accent_color": "#9DBDE7",
    "sort_order": 150,
    "rarity": null
  },
  {
    "id": "cycle_commander",
    "name": "Cycle Commander",
    "category": "market_legends",
    "source_type": "level",
    "required_level": 71,
    "tier": 15,
    "icon": "flame",
    "accent_color": "#DAA17F",
    "sort_order": 151,
    "rarity": null
  },
  {
    "id": "wall_street_royalty",
    "name": "Wall Street Royalty",
    "category": "capital_empire",
    "source_type": "level",
    "required_level": 71,
    "tier": 15,
    "icon": "crown",
    "accent_color": "#E4CC91",
    "sort_order": 152,
    "rarity": null
  },
  {
    "id": "chief_investment_officer",
    "name": "Chief Investment Officer",
    "category": "professional_path",
    "source_type": "level",
    "required_level": 76,
    "tier": 16,
    "icon": "mortarboard",
    "accent_color": "#9DBDE7",
    "sort_order": 160,
    "rarity": null
  },
  {
    "id": "stormbreaker",
    "name": "Stormbreaker",
    "category": "market_legends",
    "source_type": "level",
    "required_level": 76,
    "tier": 16,
    "icon": "flame",
    "accent_color": "#DAA17F",
    "sort_order": 161,
    "rarity": null
  },
  {
    "id": "dynasty_founder",
    "name": "Dynasty Founder",
    "category": "capital_empire",
    "source_type": "level",
    "required_level": 76,
    "tier": 16,
    "icon": "crown",
    "accent_color": "#E4CC91",
    "sort_order": 162,
    "rarity": null
  },
  {
    "id": "investment_sage",
    "name": "Investment Sage",
    "category": "professional_path",
    "source_type": "level",
    "required_level": 81,
    "tier": 17,
    "icon": "mortarboard",
    "accent_color": "#9DBDE7",
    "sort_order": 170,
    "rarity": null
  },
  {
    "id": "the_unshaken",
    "name": "The Unshaken",
    "category": "market_legends",
    "source_type": "level",
    "required_level": 81,
    "tier": 17,
    "icon": "flame",
    "accent_color": "#DAA17F",
    "sort_order": 171,
    "rarity": null
  },
  {
    "id": "legacy_architect",
    "name": "Legacy Architect",
    "category": "capital_empire",
    "source_type": "level",
    "required_level": 81,
    "tier": 17,
    "icon": "crown",
    "accent_color": "#E4CC91",
    "sort_order": 172,
    "rarity": null
  },
  {
    "id": "master_investor",
    "name": "Master Investor",
    "category": "professional_path",
    "source_type": "level",
    "required_level": 86,
    "tier": 18,
    "icon": "mortarboard",
    "accent_color": "#9DBDE7",
    "sort_order": 180,
    "rarity": null
  },
  {
    "id": "market_phantom",
    "name": "Market Phantom",
    "category": "market_legends",
    "source_type": "level",
    "required_level": 86,
    "tier": 18,
    "icon": "flame",
    "accent_color": "#DAA17F",
    "sort_order": 181,
    "rarity": null
  },
  {
    "id": "capital_titan",
    "name": "Capital Titan",
    "category": "capital_empire",
    "source_type": "level",
    "required_level": 86,
    "tier": 18,
    "icon": "crown",
    "accent_color": "#E4CC91",
    "sort_order": 182,
    "rarity": null
  },
  {
    "id": "market_visionary",
    "name": "Market Visionary",
    "category": "professional_path",
    "source_type": "level",
    "required_level": 91,
    "tier": 19,
    "icon": "mortarboard",
    "accent_color": "#9DBDE7",
    "sort_order": 190,
    "rarity": null
  },
  {
    "id": "the_untouchable",
    "name": "The Untouchable",
    "category": "market_legends",
    "source_type": "level",
    "required_level": 91,
    "tier": 19,
    "icon": "flame",
    "accent_color": "#DAA17F",
    "sort_order": 191,
    "rarity": null
  },
  {
    "id": "the_kingmaker",
    "name": "The Kingmaker",
    "category": "capital_empire",
    "source_type": "level",
    "required_level": 91,
    "tier": 19,
    "icon": "crown",
    "accent_color": "#E4CC91",
    "sort_order": 192,
    "rarity": null
  },
  {
    "id": "the_grandmaster",
    "name": "The Grandmaster",
    "category": "professional_path",
    "source_type": "level",
    "required_level": 96,
    "tier": 20,
    "icon": "mortarboard",
    "accent_color": "#9DBDE7",
    "sort_order": 200,
    "rarity": null
  },
  {
    "id": "the_apex_trader",
    "name": "The Apex Trader",
    "category": "market_legends",
    "source_type": "level",
    "required_level": 96,
    "tier": 20,
    "icon": "flame",
    "accent_color": "#DAA17F",
    "sort_order": 201,
    "rarity": null
  },
  {
    "id": "the_sovereign",
    "name": "The Sovereign",
    "category": "capital_empire",
    "source_type": "level",
    "required_level": 96,
    "tier": 20,
    "icon": "crown",
    "accent_color": "#E4CC91",
    "sort_order": 202,
    "rarity": null
  }
] as const;

export const DEMO_ACHIEVEMENT_CATEGORIES = [
  {
    "id": "first_steps",
    "name_en": "First Steps",
    "name_he": "צעדים ראשונים",
    "icon": "flag",
    "accent_color": "#8FA7C2",
    "sort_order": 1
  },
  {
    "id": "portfolio_lab",
    "name_en": "Portfolio Lab",
    "name_he": "תיקים והשקעות",
    "icon": "briefcase",
    "accent_color": "#C5A56C",
    "sort_order": 2
  },
  {
    "id": "exploration",
    "name_en": "Exploration",
    "name_he": "חקר וגילוי",
    "icon": "compass",
    "accent_color": "#9381C5",
    "sort_order": 3
  },
  {
    "id": "community_influence",
    "name_en": "Community & Influence",
    "name_he": "קהילה והשפעה",
    "icon": "users",
    "accent_color": "#64A9BB",
    "sort_order": 4
  },
  {
    "id": "the_arena",
    "name_en": "The Arena",
    "name_he": "זירת התחרויות",
    "icon": "crossed_swords",
    "accent_color": "#C88F72",
    "sort_order": 5
  },
  {
    "id": "dedication",
    "name_en": "Dedication",
    "name_he": "התמדה ומסירות",
    "icon": "hourglass",
    "accent_color": "#83B498",
    "sort_order": 6
  },
  {
    "id": "legacy_milestones",
    "name_en": "Legacy & Milestones",
    "name_he": "מורשת ונקודות ציון מהותיות",
    "icon": "crown",
    "accent_color": "#C9AB71",
    "sort_order": 7
  }
] as const;

export const DEMO_ACHIEVEMENTS = [
  {
    "id": "welcome_to_the_market",
    "category_id": "first_steps",
    "name": {
      "en": "Welcome to the Market",
      "he": "ברוך הבא לשוק"
    },
    "description": {
      "en": "Create an account",
      "he": "פתיחת חשבון"
    },
    "xp_reward": 25,
    "rarity": "basic",
    "icon": null,
    "target_value": null
  },
  {
    "id": "make_your_mark",
    "category_id": "first_steps",
    "name": {
      "en": "Make Your Mark",
      "he": "השאר את חותמך"
    },
    "description": {
      "en": "Choose a username",
      "he": "בחירת שם משתמש"
    },
    "xp_reward": 25,
    "rarity": "basic",
    "icon": null,
    "target_value": null
  },
  {
    "id": "the_introduction",
    "category_id": "first_steps",
    "name": {
      "en": "The Introduction",
      "he": "נעים להכיר"
    },
    "description": {
      "en": "Complete the basic profile",
      "he": "השלמת הפרופיל הבסיסי"
    },
    "xp_reward": 25,
    "rarity": "basic",
    "icon": null,
    "target_value": null
  },
  {
    "id": "the_opening_bell",
    "category_id": "first_steps",
    "name": {
      "en": "The Opening Bell",
      "he": "פעמון הפתיחה"
    },
    "description": {
      "en": "Create the first portfolio",
      "he": "פתיחת תיק השקעות ראשון"
    },
    "xp_reward": 50,
    "rarity": "advanced",
    "icon": null,
    "target_value": 1
  },
  {
    "id": "first_connection",
    "category_id": "first_steps",
    "name": {
      "en": "First Connection",
      "he": "הקשר הראשון"
    },
    "description": {
      "en": "Follow the first player",
      "he": "מעקב אחר שחקן ראשון"
    },
    "xp_reward": 25,
    "rarity": "basic",
    "icon": null,
    "target_value": 1
  },
  {
    "id": "a_title_to_remember",
    "category_id": "first_steps",
    "name": {
      "en": "A Title to Remember",
      "he": "תואר עם כבוד"
    },
    "description": {
      "en": "Select the first active player title",
      "he": "בחירת כינוי הרמה הראשון"
    },
    "xp_reward": 25,
    "rarity": "basic",
    "icon": null,
    "target_value": null
  },
  {
    "id": "ready_set_invest",
    "category_id": "first_steps",
    "name": {
      "en": "Ready, Set, Invest!",
      "he": "מוכנים לצאת לדרך!"
    },
    "description": {
      "en": "Complete all six previous onboarding achievements",
      "he": "השלמת ששת הישגי ההיכרות הקודמים"
    },
    "xp_reward": 50,
    "rarity": "advanced",
    "icon": null,
    "target_value": null
  },
  {
    "id": "the_second_act",
    "category_id": "portfolio_lab",
    "name": {
      "en": "The Second Act",
      "he": "המערכה השנייה"
    },
    "description": {
      "en": "Open 2 portfolios",
      "he": "פתיחת 2 תיקים"
    },
    "xp_reward": 50,
    "rarity": "advanced",
    "icon": null,
    "target_value": 2
  },
  {
    "id": "three_of_a_kind",
    "category_id": "portfolio_lab",
    "name": {
      "en": "Three of a Kind",
      "he": "שלישייה מנצחת"
    },
    "description": {
      "en": "Open 3 portfolios",
      "he": "פתיחת 3 תיקים"
    },
    "xp_reward": 50,
    "rarity": "advanced",
    "icon": null,
    "target_value": 3
  },
  {
    "id": "high_five",
    "category_id": "portfolio_lab",
    "name": {
      "en": "High Five",
      "he": "תן כיף"
    },
    "description": {
      "en": "Open 5 portfolios",
      "he": "פתיחת 5 תיקים"
    },
    "xp_reward": 100,
    "rarity": "rare",
    "icon": null,
    "target_value": 5
  },
  {
    "id": "the_portfolio_vault",
    "category_id": "portfolio_lab",
    "name": {
      "en": "The Portfolio Vault",
      "he": "כספת התיקים"
    },
    "description": {
      "en": "Open 8 portfolios",
      "he": "פתיחת 8 תיקים"
    },
    "xp_reward": 100,
    "rarity": "rare",
    "icon": null,
    "target_value": 8
  },
  {
    "id": "the_portfolio_baron",
    "category_id": "portfolio_lab",
    "name": {
      "en": "The Portfolio Baron",
      "he": "ברון התיקים"
    },
    "description": {
      "en": "Open 12 portfolios",
      "he": "פתיחת 12 תיקים"
    },
    "xp_reward": 150,
    "rarity": "epic",
    "icon": null,
    "target_value": 12
  },
  {
    "id": "the_portfolio_empire",
    "category_id": "portfolio_lab",
    "name": {
      "en": "The Portfolio Empire",
      "he": "אימפריית התיקים"
    },
    "description": {
      "en": "Open 20 portfolios",
      "he": "פתיחת 20 תיקים"
    },
    "xp_reward": 150,
    "rarity": "epic",
    "icon": null,
    "target_value": 20
  },
  {
    "id": "market_scout",
    "category_id": "exploration",
    "name": {
      "en": "Market Scout",
      "he": "סייר השוק"
    },
    "description": {
      "en": "Follow 3 players",
      "he": "מעקב אחר 3 שחקנים"
    },
    "xp_reward": 25,
    "rarity": "basic",
    "icon": null,
    "target_value": 3
  },
  {
    "id": "talent_spotter",
    "category_id": "exploration",
    "name": {
      "en": "Talent Spotter",
      "he": "מגלה הכישרונות"
    },
    "description": {
      "en": "Follow 5 players",
      "he": "מעקב אחר 5 שחקנים"
    },
    "xp_reward": 25,
    "rarity": "basic",
    "icon": null,
    "target_value": 5
  },
  {
    "id": "eyes_on_the_street",
    "category_id": "exploration",
    "name": {
      "en": "Eyes on the Street",
      "he": "עיניים על השוק"
    },
    "description": {
      "en": "Follow 10 players",
      "he": "מעקב אחר 10 שחקנים"
    },
    "xp_reward": 50,
    "rarity": "advanced",
    "icon": null,
    "target_value": 10
  },
  {
    "id": "network_hunter",
    "category_id": "exploration",
    "name": {
      "en": "Network Hunter",
      "he": "צייד הקשרים"
    },
    "description": {
      "en": "Follow 25 players",
      "he": "מעקב אחר 25 שחקנים"
    },
    "xp_reward": 50,
    "rarity": "advanced",
    "icon": null,
    "target_value": 25
  },
  {
    "id": "the_insider_network",
    "category_id": "exploration",
    "name": {
      "en": "The Insider Network",
      "he": "רשת המקורבים"
    },
    "description": {
      "en": "Follow 50 players",
      "he": "מעקב אחר 50 שחקנים"
    },
    "xp_reward": 100,
    "rarity": "rare",
    "icon": null,
    "target_value": 50
  },
  {
    "id": "golden_ticket",
    "category_id": "exploration",
    "name": {
      "en": "Golden Ticket",
      "he": "כרטיס הזהב"
    },
    "description": {
      "en": "Purchase the first player subscription",
      "he": "רכישת מנוי ראשון לשחקן אחר"
    },
    "xp_reward": 50,
    "rarity": "advanced",
    "icon": null,
    "target_value": 1
  },
  {
    "id": "the_private_list",
    "category_id": "exploration",
    "name": {
      "en": "The Private List",
      "he": "הרשימה הסודית"
    },
    "description": {
      "en": "Subscribe to 3 different players",
      "he": "רכישת מנויים ל־3 שחקנים שונים"
    },
    "xp_reward": 50,
    "rarity": "advanced",
    "icon": null,
    "target_value": 3
  },
  {
    "id": "members_only",
    "category_id": "exploration",
    "name": {
      "en": "Members Only",
      "he": "לחברים בלבד"
    },
    "description": {
      "en": "Subscribe to 5 different players",
      "he": "רכישת מנויים ל־5 שחקנים שונים"
    },
    "xp_reward": 100,
    "rarity": "rare",
    "icon": null,
    "target_value": 5
  },
  {
    "id": "from_fan_to_insider",
    "category_id": "exploration",
    "name": {
      "en": "From Fan to Insider",
      "he": "ממעריץ למקורב"
    },
    "description": {
      "en": "Subscribe to a player already being followed",
      "he": "רכישת מנוי לשחקן שכבר נמצאים במעקב אחריו"
    },
    "xp_reward": 50,
    "rarity": "advanced",
    "icon": null,
    "target_value": 1
  },
  {
    "id": "the_first_fan",
    "category_id": "community_influence",
    "name": {
      "en": "The First Fan",
      "he": "המעריץ הראשון"
    },
    "description": {
      "en": "Gain 1 follower",
      "he": "צבירת עוקב ראשון"
    },
    "xp_reward": 25,
    "rarity": "basic",
    "icon": null,
    "target_value": 1
  },
  {
    "id": "small_but_mighty",
    "category_id": "community_influence",
    "name": {
      "en": "Small but Mighty",
      "he": "קטן אבל חזק"
    },
    "description": {
      "en": "Reach 5 followers",
      "he": "הגעה ל־5 עוקבים"
    },
    "xp_reward": 25,
    "rarity": "basic",
    "icon": null,
    "target_value": 5
  },
  {
    "id": "the_buzz",
    "category_id": "community_influence",
    "name": {
      "en": "The Buzz",
      "he": "מתחילים לדבר"
    },
    "description": {
      "en": "Reach 10 followers",
      "he": "הגעה ל־10 עוקבים"
    },
    "xp_reward": 50,
    "rarity": "advanced",
    "icon": null,
    "target_value": 10
  },
  {
    "id": "rising_signal",
    "category_id": "community_influence",
    "name": {
      "en": "Rising Signal",
      "he": "קול שמתחזק"
    },
    "description": {
      "en": "Reach 25 followers",
      "he": "הגעה ל־25 עוקבים"
    },
    "xp_reward": 50,
    "rarity": "advanced",
    "icon": null,
    "target_value": 25
  },
  {
    "id": "word_on_the_street",
    "category_id": "community_influence",
    "name": {
      "en": "Word on the Street",
      "he": "השם עובר מפה לאוזן"
    },
    "description": {
      "en": "Reach 50 followers",
      "he": "הגעה ל־50 עוקבים"
    },
    "xp_reward": 100,
    "rarity": "rare",
    "icon": null,
    "target_value": 50
  },
  {
    "id": "market_voice",
    "category_id": "community_influence",
    "name": {
      "en": "Market Voice",
      "he": "קול בשוק"
    },
    "description": {
      "en": "Reach 100 followers",
      "he": "הגעה ל־100 עוקבים"
    },
    "xp_reward": 100,
    "rarity": "rare",
    "icon": null,
    "target_value": 100
  },
  {
    "id": "crowd_favorite",
    "category_id": "community_influence",
    "name": {
      "en": "Crowd Favorite",
      "he": "חביב הקהל"
    },
    "description": {
      "en": "Reach 250 followers",
      "he": "הגעה ל־250 עוקבים"
    },
    "xp_reward": 150,
    "rarity": "epic",
    "icon": null,
    "target_value": 250
  },
  {
    "id": "market_icon",
    "category_id": "community_influence",
    "name": {
      "en": "Market Icon",
      "he": "אייקון השוק"
    },
    "description": {
      "en": "Reach 1,000 followers",
      "he": "הגעה ל־1,000 עוקבים"
    },
    "xp_reward": 150,
    "rarity": "epic",
    "icon": null,
    "target_value": 1000
  },
  {
    "id": "first_believer",
    "category_id": "community_influence",
    "name": {
      "en": "First Believer",
      "he": "הראשון שנתן אמון"
    },
    "description": {
      "en": "Gain 1 paying subscriber",
      "he": "צבירת מנוי משלם ראשון"
    },
    "xp_reward": 50,
    "rarity": "advanced",
    "icon": null,
    "target_value": 1
  },
  {
    "id": "backed_by_five",
    "category_id": "community_influence",
    "name": {
      "en": "Backed by Five",
      "he": "חמישה מאחוריך"
    },
    "description": {
      "en": "Reach 5 paying subscribers",
      "he": "הגעה ל־5 מנויים משלמים"
    },
    "xp_reward": 50,
    "rarity": "advanced",
    "icon": null,
    "target_value": 5
  },
  {
    "id": "the_trusted_ten",
    "category_id": "community_influence",
    "name": {
      "en": "The Trusted Ten",
      "he": "עשרת הנאמנים"
    },
    "description": {
      "en": "Reach 10 paying subscribers",
      "he": "הגעה ל־10 מנויים משלמים"
    },
    "xp_reward": 100,
    "rarity": "rare",
    "icon": null,
    "target_value": 10
  },
  {
    "id": "the_inner_circle",
    "category_id": "community_influence",
    "name": {
      "en": "The Inner Circle",
      "he": "המעגל הפנימי"
    },
    "description": {
      "en": "Reach 25 paying subscribers",
      "he": "הגעה ל־25 מנויים משלמים"
    },
    "xp_reward": 100,
    "rarity": "rare",
    "icon": null,
    "target_value": 25
  },
  {
    "id": "the_syndicate",
    "category_id": "community_influence",
    "name": {
      "en": "The Syndicate",
      "he": "מועדון המשקיעים"
    },
    "description": {
      "en": "Reach 50 paying subscribers",
      "he": "הגעה ל־50 מנויים משלמים"
    },
    "xp_reward": 150,
    "rarity": "epic",
    "icon": null,
    "target_value": 50
  },
  {
    "id": "the_institution",
    "category_id": "community_influence",
    "name": {
      "en": "The Institution",
      "he": "מוסד של ממש"
    },
    "description": {
      "en": "Reach 100 paying subscribers",
      "he": "הגעה ל־100 מנויים משלמים"
    },
    "xp_reward": 150,
    "rarity": "epic",
    "icon": null,
    "target_value": 100
  },
  {
    "id": "the_powerhouse",
    "category_id": "community_influence",
    "name": {
      "en": "The Powerhouse",
      "he": "מעצמת השקעות"
    },
    "description": {
      "en": "Reach 250 paying subscribers",
      "he": "הגעה ל־250 מנויים משלמים"
    },
    "xp_reward": 250,
    "rarity": "exceptional",
    "icon": "institution",
    "target_value": 250
  },
  {
    "id": "the_market_mogul",
    "category_id": "community_influence",
    "name": {
      "en": "The Market Mogul",
      "he": "איל השוק"
    },
    "description": {
      "en": "Reach 1,000 paying subscribers",
      "he": "הגעה ל־1,000 מנויים משלמים"
    },
    "xp_reward": 500,
    "rarity": "exceptional",
    "icon": "mogul_crown",
    "target_value": 1000
  },
  {
    "id": "enter_the_arena",
    "category_id": "the_arena",
    "name": {
      "en": "Enter the Arena",
      "he": "נכנסים לזירה"
    },
    "description": {
      "en": "Enter the first competition",
      "he": "הרשמה לתחרות ראשונה"
    },
    "xp_reward": 50,
    "rarity": "advanced",
    "icon": null,
    "target_value": 1
  },
  {
    "id": "finish_what_you_started",
    "category_id": "the_arena",
    "name": {
      "en": "Finish What You Started",
      "he": "עד קו הסיום"
    },
    "description": {
      "en": "Complete the first competition",
      "he": "סיום תחרות ראשונה"
    },
    "xp_reward": 25,
    "rarity": "basic",
    "icon": null,
    "target_value": 1
  },
  {
    "id": "back_for_more",
    "category_id": "the_arena",
    "name": {
      "en": "Back for More",
      "he": "חוזרים לסיבוב נוסף"
    },
    "description": {
      "en": "Enter another competition after completing the first",
      "he": "הרשמה לתחרות נוספת לאחר סיום הראשונה"
    },
    "xp_reward": 50,
    "rarity": "advanced",
    "icon": null,
    "target_value": 1
  },
  {
    "id": "the_challenger",
    "category_id": "the_arena",
    "name": {
      "en": "The Challenger",
      "he": "קורא התיגר"
    },
    "description": {
      "en": "Enter 3 competitions",
      "he": "השתתפות ב־3 תחרויות"
    },
    "xp_reward": 50,
    "rarity": "advanced",
    "icon": null,
    "target_value": 3
  },
  {
    "id": "arena_regular",
    "category_id": "the_arena",
    "name": {
      "en": "Arena Regular",
      "he": "אורח קבוע בזירה"
    },
    "description": {
      "en": "Enter 5 competitions",
      "he": "השתתפות ב־5 תחרויות"
    },
    "xp_reward": 100,
    "rarity": "rare",
    "icon": null,
    "target_value": 5
  },
  {
    "id": "the_contender",
    "category_id": "the_arena",
    "name": {
      "en": "The Contender",
      "he": "המתחרה הרציני"
    },
    "description": {
      "en": "Enter 10 competitions",
      "he": "השתתפות ב־10 תחרויות"
    },
    "xp_reward": 100,
    "rarity": "rare",
    "icon": null,
    "target_value": 10
  },
  {
    "id": "the_circuit",
    "category_id": "the_arena",
    "name": {
      "en": "The Circuit",
      "he": "סבב התחרויות"
    },
    "description": {
      "en": "Enter 25 competitions",
      "he": "השתתפות ב־25 תחרויות"
    },
    "xp_reward": 150,
    "rarity": "epic",
    "icon": null,
    "target_value": 25
  },
  {
    "id": "arena_legend",
    "category_id": "the_arena",
    "name": {
      "en": "Arena Legend",
      "he": "אגדת הזירה"
    },
    "description": {
      "en": "Enter 50 competitions",
      "he": "השתתפות ב־50 תחרויות"
    },
    "xp_reward": 150,
    "rarity": "epic",
    "icon": null,
    "target_value": 50
  },
  {
    "id": "across_the_seasons",
    "category_id": "the_arena",
    "name": {
      "en": "Across the Seasons",
      "he": "מתחרה בכל עונה"
    },
    "description": {
      "en": "Enter competitions in 3 different calendar months",
      "he": "השתתפות בתחרויות בשלושה חודשים קלנדריים שונים"
    },
    "xp_reward": 100,
    "rarity": "rare",
    "icon": null,
    "target_value": 3
  },
  {
    "id": "still_in_the_game",
    "category_id": "dedication",
    "name": {
      "en": "Still in the Game",
      "he": "עדיין במשחק"
    },
    "description": {
      "en": "Keep a portfolio open for 30 days",
      "he": "החזקת תיק פתוח במשך 30 ימים"
    },
    "xp_reward": 25,
    "rarity": "basic",
    "icon": null,
    "target_value": 30
  },
  {
    "id": "playing_the_long_game",
    "category_id": "dedication",
    "name": {
      "en": "Playing the Long Game",
      "he": "משחק לטווח הארוך"
    },
    "description": {
      "en": "Keep a portfolio open for 90 days",
      "he": "החזקת תיק פתוח במשך 90 ימים"
    },
    "xp_reward": 50,
    "rarity": "advanced",
    "icon": null,
    "target_value": 90
  },
  {
    "id": "the_half_year_mark",
    "category_id": "dedication",
    "name": {
      "en": "The Half-Year Mark",
      "he": "חצי שנה של השקעות"
    },
    "description": {
      "en": "Keep a portfolio open for 180 days",
      "he": "החזקת תיק פתוח במשך 180 ימים"
    },
    "xp_reward": 50,
    "rarity": "advanced",
    "icon": null,
    "target_value": 180
  },
  {
    "id": "one_year_veteran",
    "category_id": "dedication",
    "name": {
      "en": "One-Year Veteran",
      "he": "ותיק של שנה"
    },
    "description": {
      "en": "Keep a portfolio open for 365 days",
      "he": "החזקת תיק פתוח במשך שנה"
    },
    "xp_reward": 100,
    "rarity": "rare",
    "icon": null,
    "target_value": 365
  },
  {
    "id": "the_two_year_club",
    "category_id": "dedication",
    "name": {
      "en": "The Two-Year Club",
      "he": "מועדון השנתיים"
    },
    "description": {
      "en": "Keep a portfolio open for 730 days",
      "he": "החזקת תיק פתוח במשך שנתיים"
    },
    "xp_reward": 150,
    "rarity": "epic",
    "icon": null,
    "target_value": 730
  },
  {
    "id": "double_anchor",
    "category_id": "dedication",
    "name": {
      "en": "Double Anchor",
      "he": "שני עוגנים"
    },
    "description": {
      "en": "Keep 2 portfolios open for at least 90 days each",
      "he": "החזקת שני תיקים פתוחים למשך 90 ימים לפחות לכל תיק"
    },
    "xp_reward": 50,
    "rarity": "advanced",
    "icon": null,
    "target_value": 90
  },
  {
    "id": "inner_circle_regular",
    "category_id": "dedication",
    "name": {
      "en": "Inner Circle Regular",
      "he": "חבר קבוע במעגל"
    },
    "description": {
      "en": "Maintain a paid subscription to the same player for 3 consecutive billing months",
      "he": "החזקת מנוי בתשלום לאותו שחקן במשך 3 חודשי חיוב רצופים"
    },
    "xp_reward": 50,
    "rarity": "advanced",
    "icon": null,
    "target_value": 3
  },
  {
    "id": "the_annual_pass",
    "category_id": "dedication",
    "name": {
      "en": "The Annual Pass",
      "he": "כרטיס שנתי"
    },
    "description": {
      "en": "Maintain a paid subscription to the same player for 12 consecutive billing months",
      "he": "החזקת מנוי בתשלום לאותו שחקן במשך 12 חודשי חיוב רצופים"
    },
    "xp_reward": 100,
    "rarity": "rare",
    "icon": null,
    "target_value": 12
  },
  {
    "id": "founding_member",
    "category_id": "legacy_milestones",
    "name": {
      "en": "Founding Member",
      "he": "חבר מייסד"
    },
    "description": {
      "en": "Join during the official launch period",
      "he": "הצטרפות בתקופת ההשקה הרשמית"
    },
    "xp_reward": 100,
    "rarity": "rare",
    "icon": null,
    "target_value": null
  },
  {
    "id": "the_first_five",
    "category_id": "legacy_milestones",
    "name": {
      "en": "The First Five",
      "he": "חמשת הראשונים"
    },
    "description": {
      "en": "Unlock 5 Game Achievements",
      "he": "פתיחת 5 הישגי משחק"
    },
    "xp_reward": 25,
    "rarity": "basic",
    "icon": null,
    "target_value": 5
  },
  {
    "id": "the_trophy_case",
    "category_id": "legacy_milestones",
    "name": {
      "en": "The Trophy Case",
      "he": "ארון הגביעים"
    },
    "description": {
      "en": "Unlock 15 Game Achievements",
      "he": "פתיחת 15 הישגי משחק"
    },
    "xp_reward": 50,
    "rarity": "advanced",
    "icon": null,
    "target_value": 15
  },
  {
    "id": "hall_of_fame",
    "category_id": "legacy_milestones",
    "name": {
      "en": "Hall of Fame",
      "he": "היכל התהילה"
    },
    "description": {
      "en": "Unlock 30 Game Achievements",
      "he": "פתיחת 30 הישגי משחק"
    },
    "xp_reward": 100,
    "rarity": "rare",
    "icon": null,
    "target_value": 30
  },
  {
    "id": "the_full_experience",
    "category_id": "legacy_milestones",
    "name": {
      "en": "The Full Experience",
      "he": "החוויה המלאה"
    },
    "description": {
      "en": "Open a portfolio, purchase a subscription, and enter a competition",
      "he": "פתיחת תיק, רכישת מנוי והשתתפות בתחרות"
    },
    "xp_reward": 100,
    "rarity": "rare",
    "icon": null,
    "target_value": null
  },
  {
    "id": "both_sides_of_the_market",
    "category_id": "legacy_milestones",
    "name": {
      "en": "Both Sides of the Market",
      "he": "משני צדי השוק"
    },
    "description": {
      "en": "Purchase a subscription to another player and gain a paying subscriber",
      "he": "רכישת מנוי לשחקן אחר וצבירת מנוי משלם ראשון"
    },
    "xp_reward": 100,
    "rarity": "rare",
    "icon": null,
    "target_value": null
  },
  {
    "id": "the_grand_tour",
    "category_id": "legacy_milestones",
    "name": {
      "en": "The Grand Tour",
      "he": "המסע הגדול"
    },
    "description": {
      "en": "Unlock at least one achievement in each of the other 6 categories",
      "he": "פתיחת הישג אחד לפחות בכל אחת משש הקטגוריות האחרות"
    },
    "xp_reward": 150,
    "rarity": "epic",
    "icon": null,
    "target_value": 6
  }
] as const;
