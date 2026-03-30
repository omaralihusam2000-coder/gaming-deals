# What Game Deals We Got - V19

# Core3 Deals V7 - Safe Store Links

Focused version built around:
- Steam
- Epic Games
- GOG

## What's new in V7
- Safe Epic linking
- Safe GOG linking
- No guessed Epic direct URLs that cause 404
- No guessed GOG direct URLs unless a real slug exists
- Steam still uses direct app links when app ID exists
- Epic and GOG use direct links only when a real slug is available
- Otherwise they open the store's search page instead of CheapShark

## Run
```bash
npm install
npm run dev
```


## V8 changes
- Replaced the right side hero text list with a more user-focused attraction section
- Fixed hero buttons so they jump to real sections on the homepage
- Increased the number of loaded deals on the homepage and store pages


## V9 changes
- Fixed filter dropdown readability on dark UI
- Fixed select option colors so they are no longer white-on-white
- Kept previous hero and deal count improvements
- Ensured the homepage shows deals from all 3 stores when no specific store is selected


## V10 changes
- Changed dropdown theme so it better matches the page instead of looking too bright
- Homepage now shows deals from all available stores when no store is selected
- Hero buttons now scroll to real sections instead of behaving like empty links
- Core 3 stores remain featured in the hero/store section, while the main deals browser can show broader results


## V11 changes
- Fixed Latest Core Deals so it only shows Steam, Epic Games, and GOG
- Restored the homepage filter logic to stay limited to the 3 core stores
- Kept dropdown theme fixes and hero button fixes


## V12 changes
- Replaced native filter dropdowns with custom React dark dropdowns
- Fixed the white native dropdown issue completely
- Kept all previous hero, search, and core-3-only fixes


## V13 changes
- Added Featured Deals section
- Added smart filter chips
- Improved deal card visual hierarchy
- Added Load More button for the deals grid


## V14 changes
- Cleaned up the page layout to reduce visual clutter
- Reduced Featured Deals count for clearer separation from Latest Core Deals
- Increased Latest Core Deals visible count and Load More step
- Kept Latest Core Deals limited to Steam, Epic Games, and GOG only


## V15 changes
- Added footer across the site
- Added About page and navbar link
- Simplified and polished the filters area
- Improved Featured Deals separation from Latest Core Deals
- Improved deal card clarity and saved-state badge
- Added empty state for no results
- Added clearer Load More feedback


## V16 changes
- Improved smart filter chip behavior
- Clicking a quick filter now scrolls to the deals section
- Added live counts to each smart filter chip
- Improved empty-state message for quick filters


## V17 changes
- Fixed the main deals fetch when "All Core Stores" is selected
- The homepage now fetches deals from Steam, Epic Games, and GOG separately, then merges them
- This avoids the old behavior where only a few deals appeared after filtering global results


## V18 changes
- Added duplicate filtering for the main merged deals list
- Added clearer live stores banner above Latest Core Deals
- Improved Featured Deals visual emphasis with larger card styling
- Added load-more skeleton feedback and disabled state during loading
