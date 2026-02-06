
# VERBLOC App Icon Requirements

## 🚨 CRITICAL: Current Icon is a Placeholder

The current app icon (`assets/images/app-icon-txp.png`) appears to be a placeholder and **MUST** be replaced before store submission.

---

## 📐 Technical Requirements

### iOS (App Store)
- **Size:** 1024x1024 pixels
- **Format:** PNG
- **Color Space:** sRGB or P3
- **Transparency:** NO (must be opaque)
- **Rounded Corners:** NO (iOS adds them automatically)
- **File Size:** Under 1MB recommended

### Android (Google Play)
- **Adaptive Icon Foreground:** 512x512 pixels (PNG)
- **Adaptive Icon Background:** 512x512 pixels (PNG or solid color)
- **Legacy Icon:** 512x512 pixels (PNG)
- **Safe Zone:** Keep important content within center 66% circle
- **Transparency:** Allowed on foreground layer

---

## 🎨 Design Guidelines

### Brand Identity
VERBLOC is a **strategic word puzzle game** where words transform the board.

**Visual Themes to Consider:**
- Letter tiles or blocks
- Grid/puzzle board elements
- Word formation (letters connecting)
- Strategic/tactical feel
- Modern, clean, professional
- Vibrant but not childish

**Color Palette (from app):**
- Primary: #6366F1 (Indigo)
- Secondary: #8B5CF6 (Purple)
- Accent: #F59E0B (Amber)
- Highlight: #10B981 (Green)

### Icon Style Recommendations

**Option 1: Letter Block**
- Large "V" or "VERBLOC" in stylized blocks
- 3D effect with depth
- Gradient using brand colors
- Clean, recognizable from distance

**Option 2: Grid + Letter**
- Puzzle grid background
- Central letter or word
- Suggests gameplay mechanic
- Modern, game-focused

**Option 3: Abstract Puzzle**
- Interlocking letter shapes
- Geometric, strategic feel
- Unique and memorable
- Professional appearance

### What to AVOID
- ❌ Generic word game clipart
- ❌ Too much text (hard to read when small)
- ❌ Complex details (won't scale well)
- ❌ Copying other word game icons
- ❌ Low contrast (hard to see)
- ❌ Busy backgrounds

---

## 🛠️ How to Create Your Icon

### Option 1: Hire a Designer (Recommended)
**Platforms:**
- Fiverr ($20-100)
- Upwork ($50-300)
- 99designs (contest, $299+)
- Dribbble (hire top designers)

**What to Provide:**
- App name: VERBLOC
- App description: Strategic word puzzle game
- Brand colors (listed above)
- Style preferences
- Technical requirements (this document)

### Option 2: Design Tools
**Professional:**
- Adobe Illustrator (vector, best quality)
- Figma (free, collaborative)
- Sketch (Mac only)

**Beginner-Friendly:**
- Canva Pro (templates available)
- Affinity Designer (one-time purchase)
- Procreate (iPad, great for illustration)

### Option 3: Icon Generator Services
**AI-Powered:**
- Midjourney (AI art, requires refinement)
- DALL-E 3 (AI art, requires refinement)
- Stable Diffusion (AI art, free but technical)

**Template-Based:**
- App Icon Generator (online tools)
- Icon Kitchen (Android adaptive icons)
- MakeAppIcon (generates all sizes)

---

## 📦 File Structure

Once you have your icon, replace these files:

```
assets/images/
├── app-icon.png          (1024x1024 for iOS)
├── adaptive-icon.png     (512x512 for Android foreground)
└── adaptive-icon-bg.png  (512x512 for Android background)
```

Update `app.json`:
```json
{
  "expo": {
    "icon": "./assets/images/app-icon.png",
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#000000"
      }
    }
  }
}
```

---

## ✅ Icon Checklist

Before finalizing your icon:

### Visual Quality
- [ ] Looks good at 1024x1024 (full size)
- [ ] Recognizable at 60x60 (home screen)
- [ ] Readable at 40x40 (settings)
- [ ] Works on light backgrounds
- [ ] Works on dark backgrounds
- [ ] No pixelation or blur
- [ ] High contrast and clarity

### Brand Alignment
- [ ] Represents VERBLOC concept
- [ ] Uses brand colors
- [ ] Feels professional
- [ ] Stands out from competitors
- [ ] Memorable and unique

### Technical Compliance
- [ ] 1024x1024 PNG for iOS
- [ ] No transparency (iOS)
- [ ] No rounded corners (iOS)
- [ ] 512x512 adaptive icon (Android)
- [ ] Safe zone respected (Android)
- [ ] File size under 1MB

### Testing
- [ ] Tested on iOS home screen
- [ ] Tested on Android home screen
- [ ] Tested in App Store search results
- [ ] Tested in Google Play search results
- [ ] Shown to 5+ people for feedback

---

## 🎯 Quick Start: Temporary Icon

If you need to submit quickly and don't have time for a custom icon, here's a **temporary solution** (NOT recommended for final release):

1. Use a simple letter "V" in a circle
2. Brand color gradient background
3. Clean, professional font
4. No complex details

**Tools for Quick Icon:**
- Canva: Search "app icon template"
- Figma: Use "App Icon" community templates
- Online generators: "app icon maker"

**Remember:** This is TEMPORARY. Plan to update with a professional icon in your first update.

---

## 📊 Icon Performance Metrics

After launch, monitor:
- **Conversion Rate:** How many people download after seeing icon
- **Recognition:** Can users find your app by icon alone?
- **A/B Testing:** Test different icons (after initial launch)

Good icons can improve download rates by 20-30%!

---

## 🆘 Need Help?

**Icon Design Resources:**
- r/AppIconDesign (Reddit community)
- Designer News (feedback from designers)
- App Icon Book (showcase of great icons)

**VERBLOC Support:**
- Email: design@verbloc.app

---

## 🚀 Next Steps

1. **Decide on design direction** (letter block, grid, abstract)
2. **Choose creation method** (hire designer, DIY, generator)
3. **Create icon** following technical requirements
4. **Test on devices** (iOS and Android)
5. **Get feedback** from potential users
6. **Iterate** if needed
7. **Replace placeholder** in project
8. **Rebuild app** with new icon
9. **Submit to stores** 🎉

---

**Your icon is the first impression of VERBLOC. Make it count!**
