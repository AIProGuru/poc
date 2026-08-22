-- Platform data checks after db_refresh (run on the app database).

-- 1) Matching: claims with vs without 835
SELECT
  SUM(CASE WHEN id_835 IS NULL OR id_835 = 0 THEN 1 ELSE 0 END) AS unmatched_pend277_candidates,
  SUM(CASE WHEN id_835 IS NOT NULL AND id_835 <> 0 THEN 1 ELSE 0 END) AS matched_with_835
FROM CUSTOM_ALL;

-- 2) Denials nav uses CUSTOM_ALL.Category (from carc.DenialCategory).
-- Empty Category => claim will NOT appear under Authorization/Billing/etc.
SELECT
  CASE
    WHEN Category IS NULL OR TRIM(Category) = '' THEN '(NULL/empty)'
    ELSE Category
  END AS category_bucket,
  COUNT(*) AS cnt,
  SUM(CASE WHEN ROUND(Balance, 2) <> 0 THEN 1 ELSE 0 END) AS open_balance_cnt
FROM CUSTOM_ALL
GROUP BY category_bucket
ORDER BY cnt DESC;

-- 3) Sample claim rows
SELECT ClaimNo, id_835, PrimaryGroup, PrimaryCode, Category, Balance, Remark
FROM CUSTOM_ALL
WHERE ClaimNo LIKE 'CLM2025%'
ORDER BY ClaimNo
LIMIT 40;

-- 4) Pend 835 is NOT "has 835". It is: missing 835 AND has Optum 277 response.
-- Pend 277 is: missing 835 AND no Optum 277 response.
