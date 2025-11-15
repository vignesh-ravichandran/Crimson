# 🌱 Seeded Analytics Data - Quick Reference

**Date**: November 15, 2025  
**User**: vigneshravichandran27@gmail.com

---

## ✅ What Was Created

### **New Journey**: 🎯 Complete Wellness Journey

**Description**: A comprehensive 6-dimension wellness program tracking physical health, mental wellbeing, nutrition, sleep, social connections, and personal growth.

**Journey ID**: `60d8df1e-f71e-41bb-95d5-8848813c8366`

**Status**: Public, Active  
**Your Role**: Owner

---

## 📊 Dimensions (6 total)

1. **Physical Exercise** (Weight: 5)
   - Cardio, strength training, and flexibility work
   - Varies a lot, lower on weekends
   - Max score per check-in: 15

2. **Mental Wellness** (Weight: 4)
   - Meditation, mindfulness, and stress management
   - Most consistent dimension
   - Max score per check-in: 12

3. **Nutrition** (Weight: 5)
   - Healthy eating, meal planning, and hydration
   - Generally good with occasional bad days
   - Max score per check-in: 15

4. **Sleep Quality** (Weight: 4)
   - Sleep duration, consistency, and restfulness
   - Consistent, slightly worse on weekends
   - Max score per check-in: 12

5. **Social Connection** (Weight: 3)
   - Quality time with friends and family
   - MUCH higher on weekends!
   - Max score per check-in: 9

6. **Personal Growth** (Weight: 3)
   - Learning, reading, and skill development
   - Steady with improvement over time
   - Max score per check-in: 9

**Total possible score per day**: 72

---

## 📅 Check-in Data

**Period**: September 16 - November 14, 2025 (60 days)  
**Check-ins created**: 51 days  
**Gaps**: 9 days (realistic pattern - some missed days)

**Score Range**: 38.0 to 72.0  
**Pattern**: Shows improvement over time (50s → 60s → 70s)

### **Streak Stats**
- **Current Streak**: 3 days 🔥
- **Longest Streak**: 20 days 🏆

---

## 📈 Data Patterns (Realistic!)

### **Weekend Effects**
- Physical Exercise: **30% lower** on weekends
- Social Connection: **Much higher** on weekends
- Sleep Quality: Slightly worse on weekends

### **Improvement Over Time**
- Scores gradually increase from start to end
- Shows up to **50% improvement** over 60 days

### **Realistic Variations**
- ✅ Some dimensions more consistent than others
- ✅ Occasional "bad days" (like nutrition dips)
- ✅ Gaps in check-ins (15-30% miss rate)
- ✅ Weekend vs weekday patterns

---

## 🎯 How to Test the Charts

### **Step 1: Navigate to Journey**

1. Go to http://localhost:5173
2. Click "Browse Journeys" or "My Journeys"
3. Find: **"🎯 Complete Wellness Journey"**
4. Click to view details

### **Step 2: Open Analytics**

Click the **"📊 Analytics"** button (top-right, next to "Check In Now")

### **Step 3: Explore Each Chart**

#### **🕸️ Spider Chart** (Default)
**What to look for**:
- 6-sided web pattern
- Social Connection might be stronger (due to weekends)
- Physical Exercise and Nutrition are highest weighted
- Should see balanced but not perfect shape

**Change date range** to see how the shape changes!

---

#### **📈 Line Chart**
**What to look for**:
- ~51 data points from Sept to Nov
- **Upward trend** (improvement over time)
- Some dips (weekend effects)
- Smooth line showing progress

**Stats below**:
- Average: ~60-62
- Highest: 72
- Lowest: 38

---

#### **📊 Stacked Bar Chart**
**What to look for**:
- Each bar = one day
- 6 different colors (one per dimension)
- Bars get taller over time (improvement)
- Weekend bars might look different (Social Connection segment larger)

**Hover over bars** to see dimension-specific scores!

---

#### **🗓️ Calendar Heatmap**
**What to look for**:
- 60 days displayed (Sept 16 - Nov 14)
- Darker crimson = higher scores
- **9 empty squares** (missed days)
- Recent days should be darkest (highest scores)

**Stats**:
- Total Days: 60
- Check-ins: 51
- Consistency: 85%

---

## 🧪 Testing Scenarios

### **Test 1: Different Date Ranges**

1. Start with **"All Time"** (default)
   - Should show all 51 check-ins
   
2. Switch to **"Month"**
   - Should show last 30 days
   - Scores should be higher (recent improvement)
   
3. Switch to **"Week"**
   - Should show last 7 days
   - Line chart will have fewer points
   - Might show weekend pattern

4. Switch to **"3 Months"**
   - Should show all data (journey is < 3 months old)

### **Test 2: Chart Type Comparisons**

1. **Spider Chart** → See dimension balance at a glance
2. **Line Chart** → See the improvement trend
3. **Bar Chart** → See which days you focused on which dimensions
4. **Heatmap** → See consistency and gaps

### **Test 3: Interactive Features**

- **Hover over charts** → Tooltips should appear
- **Hover over heatmap squares** → Date + score shown below
- **Switch charts rapidly** → Should load instantly (data cached)
- **Change date ranges** → ~300ms load time

### **Test 4: Mobile Responsiveness**

1. Open Chrome DevTools (F12)
2. Toggle device toolbar (mobile view)
3. Test on iPhone and iPad sizes
4. Charts should resize properly
5. Calendar heatmap should scroll horizontally if needed

---

## 📱 Expected Visual Appearance

### **Spider Chart**
```
         Physical Exercise (highest)
              /        \
  Mental    /            \   Nutrition
  Wellness |              | (highest)
           |    WEB      |
 Personal  |   SHAPE    | Sleep
  Growth    \          /  Quality
              \      /
         Social Connection
         (spikes on weekends)
```

### **Line Chart**
```
Score
72 |                                    ●
   |                              ●  ●    
66 |                    ●    ●  ●         
60 |          ●   ●  ●   ●              
54 |    ●  ●                             
48 | ●                                   
   +----------------------------------------
   Sept              Oct             Nov
```

### **Bar Chart**
```
Each bar is stacked with 6 colors showing dimensions
Bars get taller over time
```

### **Heatmap**
```
Grid of squares (like GitHub contributions)
Empty = no check-in
Light crimson = lower score
Dark crimson = higher score
```

---

## 🎨 Color Coding

All charts use the **Crimson Club** palette:
- `#DC143C` - Crimson Red (primary)
- `#8B0000` - Dark Red
- `#CD5C5C` - Indian Red
- `#B22222` - Firebrick
- `#A52A2A` - Brown
- `#800000` - Maroon

Each dimension gets one of these colors in the Spider and Bar charts.

---

## 🐛 Troubleshooting

### **If Charts Are Empty**

Check browser console (F12):
```javascript
// Should see:
📊 Analytics data loaded: {
  radar: 6,
  line: 51,
  bar: 51,
  heatmap: 51
}
```

If you see `radar: 0` or errors:
1. Check that you're logged in as `vigneshravichandran27@gmail.com`
2. Hard refresh: `Cmd + Shift + R`
3. Check backend logs: `tail -f /tmp/crimson-api.log`

### **If Journey Doesn't Appear**

1. Go to "My Journeys" filter (not "All Journeys")
2. Search for "Complete Wellness"
3. Make sure you're logged in with correct account

### **If Scores Look Wrong**

This is normal! The data is realistic:
- Scores vary from 38 to 72
- Gaps in check-ins are intentional
- Weekend patterns are by design

---

## 📊 Database Details

If you want to verify the data directly:

```sql
-- Check journey exists
SELECT * FROM journeys WHERE title LIKE '%Complete Wellness%';

-- Check dimensions
SELECT * FROM dimensions WHERE journey_id = '60d8df1e-f71e-41bb-95d5-8848813c8366';

-- Check check-ins count
SELECT COUNT(*) FROM checkins WHERE journey_id = '60d8df1e-f71e-41bb-95d5-8848813c8366';

-- Check date range
SELECT MIN(date), MAX(date) FROM checkins WHERE journey_id = '60d8df1e-f71e-41bb-95d5-8848813c8366';

-- Check scores
SELECT AVG(total_score), MIN(total_score), MAX(total_score) 
FROM checkins WHERE journey_id = '60d8df1e-f71e-41bb-95d5-8848813c8366';
```

---

## ✨ What Makes This Data Good for Testing

1. **60 days of history** - Enough to see trends
2. **6 dimensions** - Tests all chart features
3. **51 check-ins** - Realistic (not perfect 60/60)
4. **Realistic patterns**:
   - Weekend effects
   - Improvement over time
   - Dimensional variations
   - Some gaps
5. **Good streak** - 20 day longest shows commitment
6. **Score variety** - Range from 38 to 72

---

## 🚀 Ready to Test!

**Everything is set up!**

1. ✅ Journey created with 6 dimensions
2. ✅ 51 check-ins seeded over 60 days
3. ✅ Realistic patterns and variations
4. ✅ Current 3-day streak active
5. ✅ Data ready for all 4 chart types

**Go test it now**: http://localhost:5173

**Find**: "🎯 Complete Wellness Journey"  
**Click**: "📊 Analytics"  
**Enjoy**: Beautiful data visualizations! 🎉

---

_Seed script: `api/src/scripts/seed-analytics-data.ts`_

