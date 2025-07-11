# Enhanced Ad Image Filtering for Korean Blog Platforms

## Problem Analysis

The original filtering code was catching 11 images including advertisements from the Tistory blog page because it only used basic AdSense selectors and simple size-based filtering. This was insufficient for Korean blog platforms that use multiple ad networks and affiliate content.

## Solution Overview

I've implemented a comprehensive multi-layer filtering system specifically designed for Korean blog platforms like Tistory, Naver Blog, and others.

## Key Improvements

### 1. Enhanced Ad Content Removal (`removeAdContent`)

**Original Code:**
```typescript
$('.adsbygoogle, .revenue_unit_item, [class*="adsense"], ins.kakao_ad_area, div[id^="google_ads"]').remove();
```

**New Comprehensive Removal:**
- **Google AdSense**: Basic AdSense containers
- **Kakao AdFit**: Korea's major ad platform (`[class*="kakao_ad"], [class*="adfit"]`)
- **Tistory-specific**: `.tt_article_useless_p_margin, .another_category, .blogRelated`
- **Affiliate content**: `.affiliate, [class*="affiliate"], [data-affiliate]`
- **Korean ad networks**: Criteo, Tenmax, Recopick
- **Content recommendations**: Dable, Outbrain, Taboola
- **Text-based filtering**: Korean promotional phrases (광고, 후원, 제휴)
- **Tracking pixels**: 1x1 images and analytics trackers

### 2. Smart Image Classification (`isContentImage`)

**Original Code:**
```typescript
const images = $('img').filter((_, el) => {
  const width = parseInt($(el).attr('width') || '0', 10);
  const height = parseInt($(el).attr('height') || '0', 10);
  if ((width > 0 && width < 50) || (height > 0 && height < 50)) {
    return false;
  }
  return true;
})
```

**New Multi-Criteria Filtering:**
- **URL Pattern Analysis**: Detects ad-related domains and paths
- **CSS Class Analysis**: Identifies ad-related class names
- **Alt Text Analysis**: Filters Korean promotional text
- **Container Context**: Checks if image is inside ad containers
- **Affiliate Detection**: Identifies affiliate marketing images

### 3. Korean-Specific Patterns

#### Ad URL Patterns
- Google: `googleads`, `doubleclick`, `googlesyndication`
- Kakao: `kakao.*ad`, `adfit`, `daumcdn.*ad`
- Korean networks: `criteo`, `tenmax`, `recopick`

#### Korean Language Filtering
- **Ad indicators**: 광고 (ad), 후원 (sponsor), 제휴 (affiliate), 협찬 (sponsorship)
- **Promotional terms**: 프로모션 (promotion), 할인 (discount), 쿠폰 (coupon), 이벤트 (event)
- **Content recommendation**: 추천 (recommend), 인기 (popular), 관련 (related)

#### Korean Affiliate Platforms
- E-commerce: Coupang, Gmarket, 11st, Auction
- Naver: Naver Shop, SmartStore

### 4. Advanced Filtering Logic

#### Container-Based Filtering
```typescript
function isInAdContainer($: cheerio.CheerioAPI, el: cheerio.Element): boolean {
  const adContainerSelectors = [
    '.adsbygoogle, .revenue_unit_item, [class*="adsense"]',
    '[class*="kakao_ad"], [class*="adfit"], [id*="kakao_ad"]',
    '[class*="dable"], [class*="sponsored"], [class*="recommend"]',
    // ... more selectors
  ];
  
  for (const selector of adContainerSelectors) {
    if ($img.closest(selector).length > 0) {
      return true;
    }
  }
  return false;
}
```

#### Affiliate Content Detection
```typescript
function isAffiliateImage($: cheerio.CheerioAPI, el: cheerio.Element): boolean {
  const $link = $img.closest('a[href]');
  if ($link.length > 0) {
    const href = $link.attr('href') || '';
    const affiliatePatterns = [
      /affiliate|aff_|ref=|referrer/i,
      /coupang|gmarket|11st|auction/i,
      /naver.*shop|smartstore/i
    ];
    
    if (affiliatePatterns.some(pattern => pattern.test(href))) {
      return true;
    }
  }
  
  // Check container text for promotional keywords
  const containerText = $container.text().toLowerCase();
  const promoKeywords = ['광고', '후원', '제휴', '협찬', '할인', '쿠폰', '이벤트', '추천'];
  
  if (containerText.length < 200 && promoKeywords.some(keyword => containerText.includes(keyword))) {
    return true;
  }
  
  return false;
}
```

## Expected Results

With these improvements, the filtering system should:

1. **Reduce false positives**: Catch actual ad images instead of content images
2. **Improve accuracy**: Better distinguish between content and promotional images
3. **Handle Korean content**: Specifically address Korean language promotional patterns
4. **Cover more ad networks**: Include Korean-specific ad platforms
5. **Filter affiliate content**: Remove affiliate marketing images that shouldn't be counted as site images

## Testing Recommendations

1. **Test with multiple Korean blog platforms**: Tistory, Naver Blog, Kakao Brunch
2. **Verify affiliate content filtering**: Check e-commerce and affiliate-heavy blogs
3. **Monitor false negatives**: Ensure legitimate content images aren't filtered out
4. **Performance testing**: Ensure filtering doesn't significantly impact analysis speed

## Usage

The enhanced filtering is now automatically applied when analyzing any URL. The system will:

1. Remove ad containers before analysis
2. Apply multi-criteria filtering to remaining images
3. Count only legitimate content images for SEO analysis

This should significantly improve the accuracy of image analysis for Korean blog platforms while maintaining compatibility with international sites.