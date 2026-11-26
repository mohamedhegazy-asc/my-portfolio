# Article Authoring & Markdown Syntax Cheat-Sheet

Articles support GitHub-Flavored Markdown (`remark-gfm`), KaTeX math (`remark-math` + `rehype-katex`), syntax-highlighted copyable code blocks (`rehype-highlight`), and inline spreadsheet/file embeds. Raw HTML is disabled for security.

---

## 1. Excel / DAX Formula Block (with optional title + `fx` badge)

````markdown
```excel title="Total sales by region"
=SUMIFS(Sales[Amount], Sales[Region], "MENA")
```

> لحساب إجمالي المبيعات لمنطقة الشرق الأوسط وشمال أفريقيا بناءً على شرط المنطقة.
````

> Note: Any Markdown blockquote (`> ...`) placed **immediately after** a code block is automatically styled as an **Explanation** card.

---

## 2. SQL Block

````markdown
```sql title="Top 5 customers by revenue"
SELECT customer_id, SUM(order_total) AS total_revenue
FROM orders
WHERE status = 'completed'
GROUP BY customer_id
ORDER BY total_revenue DESC
LIMIT 5;
```
````

---

## 3. Python Block

````markdown
```python title="RFM Segmentation with Pandas"
import pandas as pd

rfm = df.groupby("customer_id").agg(
    recency=("order_date", lambda x: (snapshot - x.max()).days),
    frequency=("order_id", "nunique"),
    monetary=("amount", "sum"),
)
```
````

*(Also supported: `javascript`, `json`, `bash`, `plaintext`.)*

---

## 4. Mathematical Equations (KaTeX)

Inline math: `The sample variance is $s^2 = \frac{1}{n-1}\sum_{i=1}^n (x_i - \bar{x})^2$.`

Block math:

```markdown
$$
\text{RMSE} = \sqrt{\frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2}
$$
```

---

## 5. Tables

```markdown
| Metric | Formula | Target |
|---|---|---|
| Conversion Rate | Orders / Sessions | >= 3.5% |
| Churn Rate | Lost / Total | <= 2.0% |
```

---

## 6. Callouts (Blockquotes)

```markdown
> Always inspect missingness patterns (MCAR, MAR, MNAR) before imputing values.
```

---

## 7. Images (Cloudinary Inline & External HTTPS)

### Cloudinary Inline Image Syntax (`cld:`)
```markdown
![Alt text](cld:<publicId>#ar=<ratio>&w=<width>&align=<alignment> "Optional caption")
```

- `publicId`: Cloudinary public ID inside `portfolio/...`
- `ar`: Aspect ratio (`16:9`, `4:3`, `1:1`, `3:2`) — prevents layout shifts (CLS)
- `w`: Display width percentage (`50`, `75`, or `100`)
- `align`: RTL-aware alignment (`center`, `start`, or `end`)

**Example (75% width, aligned to start, with caption):**
```markdown
![Quarterly revenue breakdown](cld:portfolio/inline/q4-revenue#ar=16:9&w=75&align=start "Q4 Revenue by Region")
```

**Consecutive Images (Grouped Lightbox Gallery):**
Place multiple image lines consecutively (with or without blank lines between them) to navigate them together inside the Lightbox:
```markdown
![Dashboard Overview](cld:portfolio/inline/dash-1#ar=16:9&w=100&align=center "Overview")

![Cohort Retention](cld:portfolio/inline/dash-2#ar=16:9&w=100&align=center "Retention")
```

### Standard HTTPS Image
```markdown
![Distribution of monthly revenue](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80)
```

---

## 8. Inline Spreadsheet / File Embed (`asset`)

Use the asset MongoDB `_id` from the Files manager:

````markdown
```asset
id: 674f1c2a9b1e23456789abcd
```
````
