DELIMITER $$

DROP PROCEDURE IF EXISTS db_refresh$$
CREATE DEFINER=`admin`@`%` PROCEDURE `db_refresh`()
BEGIN

DROP TABLE IF EXISTS servicedate_837;
CREATE TABLE servicedate_837 AS
SELECT
  ClaimID AS id_837,
  ServiceDateFrom AS ServiceDate
FROM (
    SELECT ID, ClaimID, LineNumber, ServiceDateFrom,
           ROW_NUMBER() OVER (PARTITION BY ClaimID ORDER BY ServiceDateFrom DESC) as rn
    FROM EDI_ClaimDetail
) subquery
WHERE rn = 1;


DROP TABLE IF EXISTS servicedate_835;
CREATE TABLE servicedate_835 AS
SELECT
  EDI_PaidClaims.ID,
  EDI_PaidClaims.ClaimID,
  subquery1.ServiceDate
FROM EDI_PaidClaims
LEFT JOIN
(
  SELECT
    subquery.ClaimID,
    subquery.ServiceDate
  FROM (
    SELECT
      EDI_PaidClaimLines.ClaimID,
      COALESCE(STR_TO_DATE(EDI_PaidClaimLines.ServiceDate, '%m/%d/%Y'), EDI_PaidClaimLines.ServicePeriodStart, EDI_PaidClaimLines.ServicePeriodEnd) ServiceDate,
      ROW_NUMBER() OVER (PARTITION BY EDI_PaidClaimLines.ClaimID ORDER BY STR_TO_DATE(EDI_PaidClaimLines.ServiceDate, '%m/%d/%Y') DESC) rn
    FROM
      EDI_PaidClaimLines) subquery
  WHERE
    rn=1
) subquery1
on EDI_PaidClaims.ID=subquery1.ClaimID;



DROP TABLE IF EXISTS CUSTOM_PAID_AMOUNT;
CREATE TABLE CUSTOM_PAID_AMOUNT AS
SELECT
  EDI_PaidClaims.ID,
  SUM(ChargedAmount) ChargeAmount,
  SUM(PaidAmount) PaidAmount,
  COALESCE(EDI_PaidClaims.PatientResponsibility, 0) PatientResp,
  SUM(DeniedAmount) DeniedAmount
FROM EDI_PaidClaims
LEFT JOIN (
  SELECT
    EDI_PaidClaimLines.ClaimID,
    EDI_PaidClaimLines.ChargedAmount,
    EDI_PaidClaimLines.PaidAmount,
    SUM(EDI_PaidClaimLineAdj.AdjustmentAmount) AS DeniedAmount
  FROM EDI_PaidClaimLines
  LEFT JOIn EDI_PaidClaimLineAdj ON EDI_PaidClaimLines.ID=EDI_PaidClaimLineAdj.LineID
  GROUP BY EDI_PaidClaimLines.ID
) subquery1 ON EDI_PaidClaims.ID=subquery1.ClaimID
GROUP BY EDI_PaidClaims.ID;



DROP TABLE IF EXISTS CUSTOM_EDI_Claims_CLONE;
CREATE TABLE CUSTOM_EDI_Claims_CLONE AS
SELECT
  ID, ClaimNo,
  SUBSTRING_INDEX(ClaimNo, '-', 1) AS ClaimNoFirst,
  SUBSTRING_INDEX(ClaimNo, '-', -1) AS ClaimNoLast,
  servicedate_837.ServiceDate,
  InsuranceType,
  FedTaxID, BillProvNPI, PayerName, PayerID, PayerResponsibility, PatientFirst, PatientLast, PlaceOfService, Amount, PrincipalDiagnosis, ClaimFrequency, TransactionDate, TransactionType, PatientID, PayerAddress, PayerCity, PayerState, PayerZip, BillProvLast, BillProvAddress, BillProvCity, BillProvState, BillProvZip, BillProvSpecialty, RendProvSpecialty, PriorAuthorization
FROM EDI_Claims
LEFT JOIN servicedate_837 ON servicedate_837.id_837=EDI_Claims.ID;


DROP TABLE IF EXISTS CUSTOM_EDI_PaidClaims_CLONE;
CREATE TABLE CUSTOM_EDI_PaidClaims_CLONE AS
SELECT
  EDI_PaidClaims.ID, EDI_PaidClaims.ClaimID,
  SUBSTRING_INDEX(EDI_PaidClaims.ClaimID, '-', 1) AS ClaimIDFirst,
  SUBSTRING_INDEX(EDI_PaidClaims.ClaimID, '-', -1) AS ClaimIDLast,
  servicedate_835.ServiceDate, InsuranceType,
  ClaimStatus, PayersClaimID,
  CUSTOM_PAID_AMOUNT.ChargeAmount,
  CoverageAmount, ClaimPaid,
  CUSTOM_PAID_AMOUNT.PatientResp AS PatientResp,
  PaymentID
FROM EDI_PaidClaims
LEFT JOIN CUSTOM_PAID_AMOUNT ON CUSTOM_PAID_AMOUNT.ID=EDI_PaidClaims.ID
LEFT JOIN servicedate_835 ON servicedate_835.ID=EDI_PaidClaims.ID;



DROP TABLE IF EXISTS matching_837_835;
CREATE TABLE matching_837_835 AS
SELECT
  CUSTOM_EDI_Claims_CLONE.ID AS id_837,
  CUSTOM_EDI_PaidClaims_CLONE.ID AS id_835,
  CUSTOM_EDI_Claims_CLONE.ClaimNo,
  CUSTOM_EDI_PaidClaims_CLONE.ServiceDate AS ServiceDate835,
  ROW_NUMBER() OVER(PARTITION BY CUSTOM_EDI_Claims_CLONE.ID ORDER BY CUSTOM_EDI_PaidClaims_CLONE.ServiceDate DESC, CUSTOM_EDI_PaidClaims_CLONE.ID DESC) rn
FROM CUSTOM_EDI_Claims_CLONE
LEFT JOIN CUSTOM_EDI_PaidClaims_CLONE ON CUSTOM_EDI_Claims_CLONE.ClaimNoFirst=CUSTOM_EDI_PaidClaims_CLONE.ClaimIDFirst
AND CUSTOM_EDI_PaidClaims_CLONE.ServiceDate=CUSTOM_EDI_Claims_CLONE.ServiceDate
AND CUSTOM_EDI_PaidClaims_CLONE.ChargeAmount=CUSTOM_EDI_Claims_CLONE.Amount
ORDER BY CUSTOM_EDI_Claims_CLONE.ID;



DROP TABLE IF EXISTS CUSTOM_CATEGORY;
CREATE TABLE CUSTOM_CATEGORY AS
SELECT
  *
FROM (
  SELECT
    EDI_PaidClaims.ID,
    EDI_PaidClaimLines.ProcedureCode,
    EDI_PaidClaimLineAdj.AdjustmentGroup,
    EDI_PaidClaimLineAdj.AdjustmentReason,
    EDI_PaidClaimLineAdj.AdjustmentAmount,
    carc.DenialCategory AS Category,
    ROW_NUMBER() OVER(PARTITION BY EDI_PaidClaims.ID ORDER BY CONVERT(EDI_PaidClaimLineAdj.AdjustmentAmount, DECIMAL) DESC) AS rn
  FROM matching_837_835
  LEFT JOIN EDI_PaidClaims ON matching_837_835.id_835=EDI_PaidClaims.ID
  LEFT JOIN EDI_PaidClaimLines ON EDI_PaidClaimLines.ClaimID=EDI_PaidClaims.ID
  LEFT JOIN EDI_PaidClaimLineAdj ON EDI_PaidClaimLineAdj.LineID=EDI_PaidClaimLines.ID
  LEFT JOIN carc ON carc.Code=EDI_PaidClaimLineAdj.AdjustmentReason
) AS subquery1
WHERE subquery1.rn=1;



DROP TABLE IF EXISTS CUSTOM_PAID_SERVICE_REMARK;
CREATE TABLE CUSTOM_PAID_SERVICE_REMARK AS
SELECT DISTINCT
    matching_837_835.id_837 AS id_837,
    matching_837_835.id_835 AS id_835,
    TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(
        REPLACE(
            REPLACE(
                REPLACE(e.RemarkCodes, '\r', ''),
                'HE:', ''
            ),
            ', ', ','
        ), 
        ',', numbers.n
    ), ',', -1)) AS RemarkCode
FROM
    matching_837_835
INNER JOIN EDI_PaidClaims ON matching_837_835.id_835=EDI_PaidClaims.ID
LEFT JOIN EDI_PaidClaimLines e ON e.ClaimID=EDI_PaidClaims.ID
CROSS JOIN 
    (
        SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 
        UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 
        UNION ALL SELECT 9 UNION ALL SELECT 10
    ) numbers
WHERE 
    CHAR_LENGTH(
        REPLACE(
            REPLACE(
                REPLACE(e.RemarkCodes, '\r', ''),
                'HE:', ''
            ),
            ', ', ','
        )
    ) - CHAR_LENGTH(REPLACE(
        REPLACE(
            REPLACE(
                REPLACE(e.RemarkCodes, '\r', ''),
                'HE:', ''
            ),
            ', ', ','
        ), ',', ''
    )) >= numbers.n - 1;





DROP TABLE IF EXISTS adjustment;
CREATE TABLE adjustment AS
SELECT
  subquery1.id_837,
  SUM(EDI_PaidClaimLineAdj.AdjustmentAmount) AS AdjustmentAmount
FROM (
  SELECT
    *
  FROM matching_837_835
  WHERE matching_837_835.rn=1
) AS subquery1
INNER JOIN EDI_PaidClaims ON subquery1.id_835=EDI_PaidClaims.ID
LEFT JOIN EDI_PaidClaimLines ON EDI_PaidClaims.ID=EDI_PaidClaimLines.ClaimID
LEFT JOIN EDI_PaidClaimLineAdj ON EDI_PaidClaimLineAdj.LineID=EDI_PaidClaimLines.ID
GROUP BY subquery1.id_837;

DROP TABLE IF EXISTS adjustment45;
CREATE TABLE adjustment45 AS
SELECT
  subquery1.id_837,
  SUM(EDI_PaidClaimLineAdj.AdjustmentAmount) AS Adjustment45Amount
FROM (
  SELECT
    *
  FROM matching_837_835
  WHERE matching_837_835.rn=1
) AS subquery1
INNER JOIN EDI_PaidClaims ON subquery1.id_835=EDI_PaidClaims.ID
LEFT JOIN EDI_PaidClaimLines ON EDI_PaidClaims.ID=EDI_PaidClaimLines.ClaimID
LEFT JOIN EDI_PaidClaimLineAdj ON EDI_PaidClaimLineAdj.LineID=EDI_PaidClaimLines.ID
  AND EDI_PaidClaimLineAdj.AdjustmentGroup='CO'
  AND EDI_PaidClaimLineAdj.AdjustmentReason='45'
GROUP BY subquery1.id_837;




DROP TABLE IF EXISTS Diagnosis;
CREATE TABLE Diagnosis AS
SELECT ID, 
       ClaimNo, 
       SUBSTRING_INDEX(Diagnosis, '::', 1) AS Diagnosis,  
       CASE 
           WHEN CHAR_LENGTH(Diagnosis) > CHAR_LENGTH(SUBSTRING_INDEX(Diagnosis, '::', 1)) 
           THEN SUBSTRING_INDEX(Diagnosis, '::', -1) 
           ELSE NULL 
       END AS `Group`  
FROM (
    SELECT ID, ClaimNo, PrincipalDiagnosis AS Diagnosis FROM EDI_Claims WHERE PrincipalDiagnosis IS NOT NULL AND PrincipalDiagnosis != ''
    UNION ALL
    SELECT ID, ClaimNo, Diag2 AS Diagnosis FROM EDI_Claims WHERE Diag2 IS NOT NULL AND Diag2 != ''
    UNION ALL
    SELECT ID, ClaimNo, Diag3 AS Diagnosis FROM EDI_Claims WHERE Diag3 IS NOT NULL AND Diag3 != ''
    UNION ALL
    SELECT ID, ClaimNo, Diag4 AS Diagnosis FROM EDI_Claims WHERE Diag4 IS NOT NULL AND Diag4 != ''
    UNION ALL
    SELECT ID, ClaimNo, Diag5 AS Diagnosis FROM EDI_Claims WHERE Diag5 IS NOT NULL AND Diag5 != ''
    UNION ALL
    SELECT ID, ClaimNo, Diag6 AS Diagnosis FROM EDI_Claims WHERE Diag6 IS NOT NULL AND Diag6 != ''
    UNION ALL
    SELECT ID, ClaimNo, Diag7 AS Diagnosis FROM EDI_Claims WHERE Diag7 IS NOT NULL AND Diag7 != ''
    UNION ALL
    SELECT ID, ClaimNo, Diag8 AS Diagnosis FROM EDI_Claims WHERE Diag8 IS NOT NULL AND Diag8 != ''
    UNION ALL
    SELECT ID, ClaimNo, Diag9 AS Diagnosis FROM EDI_Claims WHERE Diag9 IS NOT NULL AND Diag9 != ''
    UNION ALL
    SELECT ID, ClaimNo, Diag10 AS Diagnosis FROM EDI_Claims WHERE Diag10 IS NOT NULL AND Diag10 != ''
    UNION ALL
    SELECT ID, ClaimNo, Diag11 AS Diagnosis FROM EDI_Claims WHERE Diag11 IS NOT NULL AND Diag11 != ''
    UNION ALL
    SELECT ID, ClaimNo, Diag12 AS Diagnosis FROM EDI_Claims WHERE Diag12 IS NOT NULL AND Diag12 != ''
    UNION ALL
    SELECT ID, ClaimNo, Diag13 AS Diagnosis FROM EDI_Claims WHERE Diag13 IS NOT NULL AND Diag13 != ''
    UNION ALL
    SELECT ID, ClaimNo, Diag14 AS Diagnosis FROM EDI_Claims WHERE Diag14 IS NOT NULL AND Diag14 != ''
    UNION ALL
    SELECT ID, ClaimNo, Diag15 AS Diagnosis FROM EDI_Claims WHERE Diag15 IS NOT NULL AND Diag15 != ''
    UNION ALL
    SELECT ID, ClaimNo, Diag16 AS Diagnosis FROM EDI_Claims WHERE Diag16 IS NOT NULL AND Diag16 != ''
    UNION ALL
    SELECT ID, ClaimNo, Diag17 AS Diagnosis FROM EDI_Claims WHERE Diag17 IS NOT NULL AND Diag17 != ''
    UNION ALL
    SELECT ID, ClaimNo, Diag18 AS Diagnosis FROM EDI_Claims WHERE Diag18 IS NOT NULL AND Diag18 != ''
    UNION ALL
    SELECT ID, ClaimNo, Diag19 AS Diagnosis FROM EDI_Claims WHERE Diag19 IS NOT NULL AND Diag19 != ''
    UNION ALL
    SELECT ID, ClaimNo, Diag20 AS Diagnosis FROM EDI_Claims WHERE Diag20 IS NOT NULL AND Diag20 != ''
    UNION ALL
    SELECT ID, ClaimNo, Diag21 AS Diagnosis FROM EDI_Claims WHERE Diag21 IS NOT NULL AND Diag21 != ''
    UNION ALL
    SELECT ID, ClaimNo, Diag22 AS Diagnosis FROM EDI_Claims WHERE Diag22 IS NOT NULL AND Diag22 != ''
    UNION ALL
    SELECT ID, ClaimNo, Diag23 AS Diagnosis FROM EDI_Claims WHERE Diag23 IS NOT NULL AND Diag23 != ''
    UNION ALL
    SELECT ID, ClaimNo, Diag24 AS Diagnosis FROM EDI_Claims WHERE Diag24 IS NOT NULL AND Diag24 != ''
    UNION ALL
    SELECT ID, ClaimNo, Diag25 AS Diagnosis FROM EDI_Claims WHERE Diag25 IS NOT NULL AND Diag25 != ''
) AS SubQuery
ORDER BY ID;




DROP TABLE IF EXISTS CUSTOM_ALL;
CREATE TABLE CUSTOM_ALL AS
SELECT
  CUSTOM_EDI_Claims_CLONE.ID,
  subquery1.id_835,
  CUSTOM_EDI_Claims_CLONE.ClaimNo,
  CUSTOM_EDI_Claims_CLONE.FedTaxID AS ProvTaxID,
  CUSTOM_EDI_Claims_CLONE.BillProvNPI AS ProvNPI,
  CUSTOM_EDI_Claims_CLONE.PayerName,
  CUSTOM_EDI_Claims_CLONE.PayerID,
  CUSTOM_EDI_Claims_CLONE.PayerResponsibility AS PayerSeq,
  CONCAT(CUSTOM_EDI_Claims_CLONE.PatientFirst, ' ', CUSTOM_EDI_Claims_CLONE.PatientLast) AS PatientName,
  STR_TO_DATE(CONCAT(EDI_ClaimPayment.LoadDate, ' ', EDI_ClaimPayment.LoadTime), '%Y-%m-%d %H:%i:%s') AS LoadDate,
  CUSTOM_EDI_Claims_CLONE.ServiceDate,
  CUSTOM_EDI_Claims_CLONE.PlaceOfService,
  CUSTOM_EDI_Claims_CLONE.Amount,
  COALESCE(allowed_latest.AllowedAmount, 0) AS AllowedAmt,
  COALESCE(allowed_by_action.AllowedAfterAction, 0) AS RecoveryAllowed,
  CUSTOM_EDI_PaidClaims_CLONE.ClaimPaid AS PaidAmt,
  CAST(COALESCE(CUSTOM_EDI_PaidClaims_CLONE.PatientResp, 0) AS DECIMAL(12,2)) AS PatientResp,
  adjustment.AdjustmentAmount AS DeniedAmt,
  COALESCE(adjustment45.Adjustment45Amount, 0) AS Adjustment45Amount,
  CUSTOM_CATEGORY.Category,
  CUSTOM_CATEGORY.AdjustmentGroup AS PrimaryGroup,
  CUSTOM_CATEGORY.AdjustmentReason AS PrimaryCode,
  CUSTOM_EDI_Claims_CLONE.PrincipalDiagnosis AS PrimaryDX,
  IFNULL(subquery2.Remark, '') AS Remark,
  CUSTOM_CATEGORY.ProcedureCode AS PrimaryProcedure,
  CUSTOM_EDI_Claims_CLONE.ClaimFrequency AS Frequency,
  CUSTOM_EDI_Claims_CLONE.TransactionDate,
  CUSTOM_EDI_Claims_CLONE.TransactionType,
  CUSTOM_EDI_Claims_CLONE.PatientID,
  CONCAT(CUSTOM_EDI_Claims_CLONE.PayerAddress, ', ', CUSTOM_EDI_Claims_CLONE.PayerCity, ', ', CUSTOM_EDI_Claims_CLONE.PayerState, ' ', CUSTOM_EDI_Claims_CLONE.PayerZip) AS PayerAddress,
  CUSTOM_EDI_Claims_CLONE.BillProvLast AS BillProvName,
  CONCAT(CUSTOM_EDI_Claims_CLONE.BillProvAddress, ', ', CUSTOM_EDI_Claims_CLONE.BillProvCity, ', ', CUSTOM_EDI_Claims_CLONE.BillProvState, ' ', CUSTOM_EDI_Claims_CLONE.BillProvZip) AS BillProvAddress,
  CUSTOM_EDI_Claims_CLONE.BillProvSpecialty AS BillTaxonomy,
  CUSTOM_EDI_Claims_CLONE.RendProvSpecialty AS RendTaxonomy,
  CUSTOM_EDI_Claims_CLONE.PriorAuthorization,
  CUSTOM_EDI_PaidClaims_CLONE.InsuranceType,
  0 AS Automation,
  0 AS OverturnAmount,
  0 AS Recovery
FROM CUSTOM_EDI_Claims_CLONE
LEFT JOIN (
  SELECT
    *
  FROM matching_837_835
  WHERE matching_837_835.rn=1
) AS subquery1 on CUSTOM_EDI_Claims_CLONE.ID=subquery1.id_837
LEFT JOIN CUSTOM_EDI_PaidClaims_CLONE ON subquery1.id_835=CUSTOM_EDI_PaidClaims_CLONE.ID
LEFT JOIN EDI_ClaimPayment ON EDI_ClaimPayment.ID=CUSTOM_EDI_PaidClaims_CLONE.PaymentID
LEFT JOIN CUSTOM_CATEGORY ON CUSTOM_CATEGORY.ID=CUSTOM_EDI_PaidClaims_CLONE.ID
LEFT JOIN adjustment ON adjustment.id_837=CUSTOM_EDI_Claims_CLONE.ID
LEFT JOIN adjustment45 ON adjustment45.id_837=CUSTOM_EDI_Claims_CLONE.ID
LEFT JOIN (
  SELECT
    ClaimID,
    SUM(AllowedAmount) AS AllowedAmount
  FROM EDI_PaidClaimLines
  GROUP BY ClaimID
) allowed_latest ON allowed_latest.ClaimID=CUSTOM_EDI_PaidClaims_CLONE.ID
LEFT JOIN (
  SELECT
    m.ClaimNo,
    SUM(
      CASE
        WHEN la.action_date IS NULL THEN COALESCE(allowed_lines.AllowedAmount, 0)
        WHEN EDI_ClaimPayment.EffectiveDate > STR_TO_DATE(la.action_date, '%m/%d/%Y')
          THEN COALESCE(allowed_lines.AllowedAmount, 0)
        ELSE 0
      END
    ) AS AllowedAfterAction
  FROM matching_837_835 m
  LEFT JOIN EDI_PaidClaims ON m.id_835=EDI_PaidClaims.ID
  LEFT JOIN (
    SELECT
      ClaimID,
      SUM(AllowedAmount) AS AllowedAmount
    FROM EDI_PaidClaimLines
    GROUP BY ClaimID
  ) allowed_lines ON allowed_lines.ClaimID=EDI_PaidClaims.ID
  LEFT JOIN EDI_ClaimPayment ON EDI_PaidClaims.PaymentID=EDI_ClaimPayment.ID
  LEFT JOIN (
    SELECT ClaimNo, MAX(action_date) AS action_date
    FROM actions
    GROUP BY ClaimNo
  ) la ON la.ClaimNo=m.ClaimNo
  GROUP BY m.ClaimNo
) AS allowed_by_action ON allowed_by_action.ClaimNo=CUSTOM_EDI_Claims_CLONE.ClaimNo
LEFT JOIN (
  SELECT CUSTOM_PAID_SERVICE_REMARK.id_835, GROUP_CONCAT(CUSTOM_PAID_SERVICE_REMARK.RemarkCode SEPARATOR '*') AS Remark FROM CUSTOM_PAID_SERVICE_REMARK GROUP BY CUSTOM_PAID_SERVICE_REMARK.id_835
) AS subquery2 on CUSTOM_EDI_PaidClaims_CLONE.ID=subquery2.id_835;

ALTER TABLE CUSTOM_ALL
ADD ActionDate DATE;

ALTER TABLE CUSTOM_ALL
ADD ActionTaken VARCHAR(20);

UPDATE CUSTOM_ALL JOIN actions ON CUSTOM_ALL.ClaimNo=actions.ClaimNo SET CUSTOM_ALL.ActionDate=STR_TO_DATE(actions.action_date,"%m/%d/%Y");
UPDATE CUSTOM_ALL JOIN actions ON CUSTOM_ALL.ClaimNo=actions.ClaimNo SET CUSTOM_ALL.ActionTaken=actions.claim_status;



DROP TABLE IF EXISTS CUSTOM_PAID;
CREATE TABLE CUSTOM_PAID AS
SELECT DISTINCT
  EDI_PaidClaims.ID,
  EDI_PaidClaims.ClaimID,
  EDI_ClaimPayment.EffectiveDate as CheckDate,
  EDI_ClaimPayment.CheckNumber,
  EDI_ClaimPayment.PaymentAmount as CheckAmount,
  EDI_ClaimPayment.PayerIDNumber as PayerID,
  EDI_ClaimPayment.PayerName,
  EDI_ClaimPayment.PayeeName as ProviderName,
  CONCAT(EDI_ClaimPayment.PayeeAddress1, ', ', EDI_ClaimPayment.PayeeCity, ', ', EDI_ClaimPayment.PayeeState, ' ', EDI_ClaimPayment.PayeeZip) as ProviderAddress,
  EDI_ClaimPayment.PayeeID as NPI,
  matching_837_835.ServiceDate835 as ServiceDate,
  EDI_PaidClaims.ClaimStatus as ProcessingStatus,
  EDI_PaidClaims.PayersClaimID as PayerClaimNumber,
  CUSTOM_PAID_AMOUNT.ChargeAmount,
  CUSTOM_PAID_AMOUNT.PaidAmount,
  CUSTOM_PAID_AMOUNT.PatientResp,
  CUSTOM_PAID_AMOUNT.DeniedAmount,
  EDI_PaidClaims.CoverageAmount
FROM matching_837_835
INNER JOIN EDI_PaidClaims ON matching_837_835.id_835=EDI_PaidClaims.ID
LEFT JOIN EDI_ClaimPayment ON EDI_PaidClaims.PaymentID=EDI_ClaimPayment.ID
LEFT JOIN CUSTOM_PAID_AMOUNT ON CUSTOM_PAID_AMOUNT.ID=EDI_PaidClaims.ID;



DROP TABLE IF EXISTS CUSTOM_PAID_SERVICE;
CREATE TABLE CUSTOM_PAID_SERVICE AS
SELECT
  EDI_PaidClaimLines.ID as id,
  EDI_PaidClaims.ID as id_835,
  EDI_PaidClaimLines.ProcedureCode,
  EDI_PaidClaimLines.ProcedureModifier1,
  EDI_PaidClaimLines.ProcedureModifier2,
  EDI_PaidClaimLines.ProcedureModifier3,
  EDI_PaidClaimLines.ProcedureModifier4,
  COALESCE(STR_TO_DATE(EDI_PaidClaimLines.ServiceDate, '%m/%d/%Y'), ServicePeriodStart, ServicePeriodEnd) ServiceDate
FROM matching_837_835
INNER JOIN EDI_PaidClaims ON matching_837_835.id_835=EDI_PaidClaims.ID
LEFT JOIN EDI_PaidClaimLines ON EDI_PaidClaimLines.ClaimID=EDI_PaidClaims.ID;



DROP TABLE IF EXISTS Procedures;
CREATE TABLE Procedures AS
SELECT ClaimID, ProcedureCode FROM EDI_ClaimDetail;



DROP TABLE IF EXISTS CUSTOM_SERVICE_CODE;
CREATE TABLE CUSTOM_SERVICE_CODE AS
SELECT
  matching_837_835.id_837,
  matching_837_835.id_835,
  EDI_PaidClaimLineAdj.AdjustmentGroup,
  EDI_PaidClaimLineAdj.AdjustmentReason,
  matching_837_835.rn
FROM matching_837_835
INNER JOIN EDI_PaidClaims ON matching_837_835.id_835=EDI_PaidClaims.ID
LEFT JOIN EDI_PaidClaimLines ON EDI_PaidClaims.ID=EDI_PaidClaimLines.ClaimID
LEFT JOIN EDI_PaidClaimLineAdj ON EDI_PaidClaimLineAdj.LineID=EDI_PaidClaimLines.ID;



DROP TABLE IF EXISTS CUSTOM_ICD;
CREATE TABLE CUSTOM_ICD AS
SELECT
  CONCAT(SUBSTR(icd24.Code, 1, 3), '.', SUBSTR(icd24.Code, 4)) AS Code,
  icd24.Description
FROM icd24;



DROP TABLE IF EXISTS CUSTOM_SERVICE;
CREATE TABLE CUSTOM_SERVICE AS
SELECT
  EDI_ClaimDetail.ClaimID AS ID,
  EDI_Claims.ClaimNo AS ClaimNo,
  EDI_ClaimDetail.ProcedureCode AS Code,
  CONCAT(COALESCE(EDI_ClaimDetail.Modifier1, ''), ',', COALESCE(EDI_ClaimDetail.Modifier2, ''), ',', COALESCE(EDI_ClaimDetail.Modifier3, ''), ',', COALESCE(EDI_ClaimDetail.Modifier4, '')) AS Modifier,
  EDI_ClaimDetail.ServiceDateFrom AS ServiceDate,
  EDI_ClaimDetail.Amount AS Charges,
  EDI_ClaimDetail.Unit AS Units,
  EDI_Claims.RendProvNPI AS RendProvNPI,
  EDI_Claims.RendProvSpecialty AS RendTaxonomy
FROM EDI_Claims
LEFT JOIN EDI_ClaimDetail ON EDI_Claims.ID=EDI_ClaimDetail.ClaimID
LEFT JOIN cpt ON cpt.Code=EDI_ClaimDetail.ProcedureCode
WHERE cpt.Type='CPT' or cpt.Type='HCPCS';



DROP TABLE IF EXISTS CUSTOM_SERVICE_CODE_FOR_TABLE;
CREATE TABLE CUSTOM_SERVICE_CODE_FOR_TABLE AS
SELECT * FROM CUSTOM_SERVICE_CODE WHERE rn=1;



DROP TABLE IF EXISTS TEMP;
CREATE TABLE TEMP AS
SELECT *
FROM (
  SELECT
    subquery1.ClaimNo,
    SUM(subquery1.CoverageAmount) CoverageAmount
  FROM (
    SELECT
      actions.ClaimNO,
      CUSTOM_PAID.CoverageAmount
    FROM actions
    LEFT JOIN matching_837_835 ON matching_837_835.ClaimNo=actions.ClaimNo
    LEFT JOIN CUSTOM_PAID ON CUSTOM_PAID.ID=matching_837_835.id_835
    WHERE STR_TO_DATE(actions.action_date, "%m/%d/%Y") <= CUSTOM_PAID.CheckDate) subquery1
  GROUP BY subquery1.ClaimNo) subquery2
WHERE subquery2.CoverageAmount IS NOT NULL;
UPDATE CUSTOM_ALL JOIN TEMP SET CUSTOM_ALL.OverturnAmount=TEMP.CoverageAmount WHERE CUSTOM_ALL.ClaimNo=TEMP.ClaimNo;
DROP TABLE IF EXISTS TEMP;

CREATE INDEX idx_id_837 ON CUSTOM_PAID_SERVICE_REMARK(id_837);
CREATE INDEX idx_ID ON CUSTOM_ALL(ID);
CREATE INDEX idx_id_835 ON CUSTOM_PAID_SERVICE_REMARK(id_835);
CREATE INDEX idx_id_837 ON CUSTOM_SERVICE_CODE_FOR_TABLE(id_837);
CREATE INDEX idx_AdjustmentGroup ON CUSTOM_SERVICE_CODE_FOR_TABLE(AdjustmentGroup);
CREATE INDEX idx_AdjustmentReason ON CUSTOM_SERVICE_CODE_FOR_TABLE(AdjustmentReason);
CREATE INDEX idx_InsuranceType ON CUSTOM_ALL(InsuranceType);
CREATE INDEX idx_PayerName ON CUSTOM_ALL(PayerName);
CREATE INDEX idx_ClaimNo ON CUSTOM_ALL(ClaimNo);
CREATE INDEX idx_PayerSeq ON CUSTOM_ALL(PayerSeq);
CREATE INDEX idx_RemarkCode ON CUSTOM_PAID_SERVICE_REMARK(RemarkCode);
CREATE INDEX idx_ActionDate ON CUSTOM_ALL(ActionDate);
CREATE INDEX idx_ActionTaken ON CUSTOM_ALL(ActionTaken);


DROP TABLE IF EXISTS TEMP;
CREATE TABLE TEMP AS
SELECT
  actions.*
FROM actions
LEFT JOIN matching_837_835 ON matching_837_835.ClaimNo=actions.ClaimNo
LEFT JOIN CUSTOM_PAID ON CUSTOM_PAID.ID=matching_837_835.id_835
WHERE STR_TO_DATE(actions.action_date, "%m/%d/%Y") <= CUSTOM_PAID.CheckDate;

CREATE INDEX idx_ClaimNo ON TEMP(ClaimNo);
CREATE INDEX idx_Recovery ON CUSTOM_ALL(Recovery);


UPDATE CUSTOM_ALL SET Recovery=1 WHERE EXISTS (SELECT 1 FROM TEMP WHERE TEMP.ClaimNo=CUSTOM_ALL.ClaimNo);

DROP TABLE IF EXISTS TEMP;

UPDATE CUSTOM_ALL SET Automation=1 WHERE EXISTS ( SELECT 1 FROM CUSTOM_PAID_SERVICE_REMARK WHERE CUSTOM_PAID_SERVICE_REMARK.id_837=CUSTOM_ALL.ID AND CUSTOM_PAID_SERVICE_REMARK.id_835=CUSTOM_ALL.id_835 AND CUSTOM_PAID_SERVICE_REMARK.RemarkCode='N255' ) AND EXISTS ( SELECT 1 FROM CUSTOM_SERVICE_CODE_FOR_TABLE WHERE CUSTOM_SERVICE_CODE_FOR_TABLE.id_837=CUSTOM_ALL.ID AND CUSTOM_SERVICE_CODE_FOR_TABLE.AdjustmentGroup='CO' AND CUSTOM_SERVICE_CODE_FOR_TABLE.AdjustmentReason='16' ) AND CUSTOM_ALL.InsuranceType='MC' AND CUSTOM_ALL.PayerName LIKE '%DSHS%';

UPDATE CUSTOM_ALL SET Automation=3 WHERE EXISTS ( SELECT 1 FROM CUSTOM_PAID_SERVICE_REMARK WHERE CUSTOM_PAID_SERVICE_REMARK.id_837=CUSTOM_ALL.ID AND CUSTOM_PAID_SERVICE_REMARK.id_835=CUSTOM_ALL.id_835 AND CUSTOM_PAID_SERVICE_REMARK.RemarkCode='M77' ) AND EXISTS ( SELECT 1 FROM CUSTOM_SERVICE_CODE_FOR_TABLE cst WHERE cst.id_837=CUSTOM_ALL.ID AND cst.AdjustmentGroup='CO' AND cst.AdjustmentReason='16' AND EXISTS ( SELECT 1 FROM denial_actions da WHERE da.ClaimNo=CUSTOM_ALL.ClaimNo ) ) AND (CUSTOM_ALL.PayerName LIKE 'REGENCE%' OR CUSTOM_ALL.PayerName LIKE '%UNITED HEALTH CARE%' OR CUSTOM_ALL.PayerName LIKE '%Humana%') AND PayerSeq='P' AND CUSTOM_ALL.Automation=0;

UPDATE CUSTOM_ALL SET Automation=4 WHERE EXISTS ( SELECT 1 FROM CUSTOM_SERVICE_CODE_FOR_TABLE WHERE CUSTOM_SERVICE_CODE_FOR_TABLE.id_837=CUSTOM_ALL.ID AND EXISTS ( SELECT 1 FROM denial_actions da WHERE da.ClaimNo=CUSTOM_ALL.ClaimNo ) AND CUSTOM_SERVICE_CODE_FOR_TABLE.AdjustmentGroup='CO' AND CUSTOM_SERVICE_CODE_FOR_TABLE.AdjustmentReason='22' ) AND CUSTOM_ALL.PayerSeq='P' AND CUSTOM_ALL.Automation=0;

UPDATE CUSTOM_ALL SET Automation=5 WHERE EXISTS ( SELECT 1 FROM CUSTOM_SERVICE_CODE_FOR_TABLE WHERE CUSTOM_SERVICE_CODE_FOR_TABLE.id_837=CUSTOM_ALL.ID AND EXISTS ( SELECT 1 FROM denial_actions da WHERE da.ClaimNo=CUSTOM_ALL.ClaimNo ) AND CUSTOM_SERVICE_CODE_FOR_TABLE.AdjustmentGroup='CO' AND CUSTOM_SERVICE_CODE_FOR_TABLE.AdjustmentReason='29' ) AND CUSTOM_ALL.PayerSeq='P' AND (CUSTOM_ALL.PayerName LIKE '%REGENCE%' OR CUSTOM_ALL.PayerName LIKE '%UHC%' OR CUSTOM_ALL.PayerName LIKE '%CIGNA%') AND CUSTOM_ALL.Automation=0;

UPDATE CUSTOM_ALL SET Automation=6 WHERE EXISTS ( SELECT 1 FROM CUSTOM_SERVICE_CODE_FOR_TABLE WHERE CUSTOM_SERVICE_CODE_FOR_TABLE.id_837=CUSTOM_ALL.ID AND EXISTS ( SELECT 1 FROM denial_actions da WHERE da.ClaimNo=CUSTOM_ALL.ClaimNo ) AND CUSTOM_SERVICE_CODE_FOR_TABLE.AdjustmentGroup='CO' AND CUSTOM_SERVICE_CODE_FOR_TABLE.AdjustmentReason='109' ) AND CUSTOM_ALL.PayerSeq='P' AND CUSTOM_ALL.Automation=0;


END$$

DELIMITER ;
