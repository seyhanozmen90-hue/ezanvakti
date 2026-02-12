# Turkey Prayer Times Coordinates

Comprehensive GPS coordinates for 30 major Turkish cities and ~120 districts for accurate Aladhan-based prayer time calculations.

## 📊 Coverage

- **30 Cities**: All major Turkish cities
- **~120 Districts**: Major districts with unique prayer times
- **~150 Total Locations**: Complete coverage for population centers

## 🗺️ Cities Included

### Marmara Region
1. Istanbul (15 districts)
2. Ankara (7 districts)  
3. Bursa (5 districts)
4. Kocaeli (3 districts)
5. Tekirdag (2 districts)
6. Sakarya (2 districts)
7. Balikesir (3 districts)

### Aegean Region
8. Izmir (9 districts)
9. Manisa (2 districts)
10. Aydin (3 districts)
11. Denizli (2 districts)

### Mediterranean Region
12. Antalya (5 districts)
13. Adana (4 districts)
14. Mersin (4 districts)
15. Hatay (2 districts)

### Central Anatolia
16. Konya (3 districts)
17. Kayseri (2 districts)
18. Sivas (1 city)
19. Eskisehir (2 districts)

### Black Sea Region
20. Samsun (3 districts)
21. Trabzon (1 district)

### Eastern Anatolia
22. Erzurum (2 districts)
23. Malatya (2 districts)
24. Elazig (1 city)
25. Van (2 districts)

### Southeast Anatolia
26. Gaziantep (2 districts)
27. Sanliurfa (3 districts)
28. Diyarbakir (3 districts)
29. Kahramanmaras (2 districts)
30. Batman (1 city)

## 🔍 Data Quality

### Validation Rules
All coordinates are validated for:

✅ **No Duplicates**: Each city+district combination is unique  
✅ **Valid Ranges**: Turkey boundaries (lat: 36-42°, lng: 26-45°)  
✅ **Orphan Check**: All districts have corresponding city entries  
✅ **Slug Format**: Lowercase ASCII only (no Turkish characters)  
✅ **Proximity Warnings**: Districts too close to city center flagged

### Normalization

Turkish characters are converted to ASCII:
- `ş` → `s`
- `ğ` → `g`
- `ı` → `i`
- `ö` → `o`
- `ü` → `u`
- `ç` → `c`

Examples:
- `Şanlıurfa` → `sanliurfa`
- `Kahramanmaraş` → `kahramanmaras`
- `İzmir` → `izmir`

## 🧪 Testing & Validation

### Run Validation Only

```bash
# Validate coordinate structure
npm run test:prayer
```

This checks for:
- Duplicate entries
- Invalid lat/lng ranges
- Missing city entries for districts
- Slug format issues
- Proximity warnings

### Run Full Test Suite

```bash
# 1. Start dev server
npm run dev

# 2. In another terminal, run tests
npm run test:prayer
```

Tests:
1. **Phase 1**: Coordinate validation
2. **Phase 2**: API smoke tests (all cities + sample districts)
3. Response format validation
4. Success rate reporting
5. Data source breakdown

### Test Output Example

```
🧪 Prayer Times Comprehensive Test Suite

📍 Base URL: http://localhost:3000

================================================================================
PHASE 1: COORDINATE VALIDATION
================================================================================

📊 COORDINATE VALIDATION RESULTS

================================================================================

📈 Statistics:
  Total Locations: 152
  Cities: 30
  Districts: 122
  Cities with districts: 25

✅ No errors found!
✅ No warnings!

================================================================================
✅ Validation PASSED

================================================================================
PHASE 2: API SMOKE TESTS
================================================================================

🏙️  Testing cities...

  istanbul            ... ✅ aladhan (05:45 → 18:03)
  ankara              ... ✅ aladhan (05:30 → 18:01)
  izmir               ... ✅ aladhan (05:24 → 17:56)
  ...

🏘️  Testing sample districts...

  istanbul (3/15 districts):
    kadikoy           ... ✅ aladhan (05:45 → 18:03)
    besiktas          ... ✅ aladhan (05:45 → 18:03)
    sisli             ... ✅ aladhan (05:45 → 18:03)

================================================================================
📊 FINAL SUMMARY
================================================================================

🔍 Coordinate Validation:
  Status: ✅ PASS
  Errors: 0
  Warnings: 0

🌐 API Tests:
  Total Requests: 105
  Passed: 105 ✅
  Failed: 0 ❌
  Success Rate: 100.0%

📈 Data Sources:
  aladhan: 105 (100.0%)

✅ ALL TESTS PASSED!
```

## 📂 File Structure

```
lib/geo/
├── tr.ts                    # Main coordinates file
├── validateCoords.ts        # Validation helper (dev only)
└── COORDINATES_README.md    # This file

scripts/
├── test-prayer-times.ts     # Comprehensive test suite
└── verify-prayer-times.ts   # Legacy smoke test
```

## 🔧 Adding New Locations

### 1. Add Coordinates

Edit `lib/geo/tr.ts` and add entry:

```typescript
// City
{ city_slug: 'yourcity', coords: { lat: XX.XXXX, lng: YY.YYYY } },

// Districts (optional)
{ city_slug: 'yourcity', district_slug: 'district1', coords: { lat: XX.XXXX, lng: YY.YYYY } },
{ city_slug: 'yourcity', district_slug: 'district2', coords: { lat: XX.XXXX, lng: YY.YYYY } },
```

### 2. Validate

```bash
npm run test:prayer
```

Fix any errors reported.

### 3. Test API

```bash
# Start dev server
npm run dev

# Test your new location
curl "http://localhost:3000/api/prayer-times?city=yourcity"
curl "http://localhost:3000/api/prayer-times?city=yourcity&district=district1"
```

### 4. Commit

```bash
git add lib/geo/tr.ts
git commit -m "feat: Add yourcity coordinates"
```

## ⚠️ Important Rules

### NEVER Do This:

❌ Add duplicate city+district combinations  
❌ Use Turkish characters in slugs (`Ş`, `İ`, `Ğ`, etc.)  
❌ Use uppercase in slugs (`Istanbul` → `istanbul`)  
❌ Add districts without city entry  
❌ Use coordinates outside Turkey boundaries  
❌ Add non-official neighborhoods (e.g., `alsancak` is not a district)

### ALWAYS Do This:

✅ Normalize slugs to lowercase ASCII  
✅ Add city entry before district entries  
✅ Use accurate GPS coordinates  
✅ Run validation after changes  
✅ Test API calls before committing  
✅ Group entries by city with comments

## 🎯 Data Sources

### Coordinates
- OpenStreetMap (primary)
- Google Maps (verification)
- Turkish Statistical Institute (TUIK) - official boundaries

### Prayer Times
- **Aladhan API**: Cities/districts with coordinates
- **Diyanet API**: Fallback for cities without coordinates

## 📈 Impact

### Before
- 3 cities (Istanbul, Ankara, Izmir)
- 17 districts
- Limited coverage

### After
- 30 cities
- ~120 districts
- ~150 total locations
- Complete coverage of major population centers
- Validation system
- Comprehensive test suite

## 🚀 CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Install dependencies
  run: npm install

- name: Start dev server
  run: npm run dev &

- name: Wait for server
  run: npx wait-on http://localhost:3000

- name: Run prayer times tests
  run: npm run test:prayer
```

## 📞 Support

Issues with coordinates? Check:

1. **Validation**: `npm run test:prayer`
2. **API Response**: Check browser network tab
3. **Logs**: Check terminal for errors
4. **Slug Format**: Ensure lowercase ASCII
5. **Coordinates**: Verify lat/lng are within Turkey

## 📝 Changelog

### v2.0.0 (2026-02-11)
- ✨ Added 27 new cities (was 3)
- ✨ Added ~103 new districts (was 17)
- ✨ New validation system (`validateCoords.ts`)
- ✨ New test suite (`test-prayer-times.ts`)
- 🐛 Fixed: Removed duplicate `sanliurfa` entry
- 🐛 Fixed: Removed non-district `alsancak`
- 🔧 Normalized all slugs to lowercase ASCII
- 📚 Added comprehensive documentation

### v1.0.0 (2026-02-10)
- 🎉 Initial release with Istanbul, Ankara, Izmir
- 📍 17 districts for major cities
- 🧪 Basic smoke test script
