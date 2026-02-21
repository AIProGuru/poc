DELIMITER $$

DROP PROCEDURE IF EXISTS gen_consolidated$$
CREATE DEFINER=`admin`@`%` PROCEDURE `gen_consolidated`()
BEGIN
    CREATE OR REPLACE VIEW all_835_consolidated_v5 AS
    SELECT DISTINCT
        pcl.ServiceDate, ec.PatientDOB, cp.ID AS claimpayment_id, pc.ID AS paid_claims_id, cp.HIN, EDIFileName, FileDate, LoadDate, PaymentAmount, PaymentMethod, cp.PayerID, EffectiveDate, CheckNumber, TRNPayerID, cp.ReceiverID, cp.PayerName, PlanId, cp.PayerIDNumber, PayeeName, PayeeID, PayeeAddress1, pc.ClaimID, pc.MemberID, pc.PolicyNumber, pc.PatientID, pc.InsuredID,
        ClaimPositioninFile, ClaimStatus, ClaimAmount, ClaimPaid, PatientResponsibility, pc.InsuranceType, PayersClaimID, pc.FacilityTypeCode, pc.ClaimFrequency, PriorAuthNum, MedicalRecordNum, ReceivedDate, RenderingID, pcl.ProcedureCode, ChargedAmount, PaidAmount, pcl.SubmittedProcedureModifier1, pcl.SubmittedProcedureModifier2, pcl.ProviderControlNo,
        pcl.AllowedAmount, pcl.RemarkCodes, pcla.LineID AS pcla_identifier, pcla.AdjustmentGroup, pcla.AdjustmentReason, AdjustmentAmount, pcla.AdjustmentQty, ProcedureModifier1, ProcedureModifier2, BillProvSpecialty, BillProvNPI, RendProvNPI, RendProvSpecialty, BillProvID, ec.FedTaxID, ec.PayerResponsibility, pc.OrigRefNo,
        CASE WHEN SUM(PaidAmount) > 0 THEN 0 ELSE 1 END AS paid_status
    FROM
        EDI_ClaimPayment cp
    JOIN
        EDI_PaidClaims pc ON cp.ID = pc.PaymentID
    JOIN
        EDI_Claims ec ON cp.ID = ec.ID
    JOIN
        EDI_PaidClaimLines pcl ON pc.ID = pcl.ClaimID
    JOIN
        EDI_PaidClaimLineAdj pcla ON pcl.ID = pcla.LineID
    GROUP BY
        pcl.ServiceDate, ec.PatientDOB, cp.ID, pc.ID, cp.HIN, EDIFileName, FileDate, LoadDate, PaymentAmount, PaymentMethod, cp.PayerID, EffectiveDate, CheckNumber, TRNPayerID, cp.ReceiverID, cp.PayerName, PlanId, cp.PayerIDNumber, PayeeName, PayeeID, PayeeAddress1, pc.ClaimID, pc.MemberID, pc.PolicyNumber, pc.PatientID, pc.InsuredID,
        ClaimPositioninFile, ClaimStatus, ClaimAmount, ClaimPaid, PatientResponsibility, pc.InsuranceType, PayersClaimID, pc.FacilityTypeCode, pc.ClaimFrequency, PriorAuthNum, MedicalRecordNum, ReceivedDate, RenderingID, pcl.ProcedureCode, ChargedAmount, PaidAmount, pcl.SubmittedProcedureModifier1, pcl.SubmittedProcedureModifier2, pcl.ProviderControlNo,
        pcl.AllowedAmount, pcl.RemarkCodes, pcla.LineID, pcla.AdjustmentGroup, pcla.AdjustmentReason, AdjustmentAmount, pcla.AdjustmentQty, ProcedureModifier1, ProcedureModifier2, BillProvSpecialty, BillProvNPI, RendProvNPI, RendProvSpecialty, BillProvID, ec.FedTaxID, ec.PayerResponsibility, pc.OrigRefNo, PayersClaimID, PayerIDNumber;

    CREATE OR REPLACE VIEW all_837_consolidated AS
    SELECT
        PayerID, PayerName, OtherPayerName, ec.ClaimFrequency, ec.FilingIndicator, ec.ClaimNo, ec.TransactionDate, ec.TransactionTime, ec.TransactionType, ec.BillProvNPI, ec.BillProvID, ec.BillProvLast, ec.BillProvIDType, ec.BillProvSpecialty AS Billing_TaxonomyCode, ec.RendProvSpecialty AS Rendering_TaxonomyCode, ec.BillProvSuffix, ec.FacilityTaxID, ec.FedTaxID, ec.FedTaxIDQual, ec.PatientID, ClaimID, LineNumber, LineID, cd.ServiceDateTo, cd.ServiceDateFrom, FacilityCode, RevenueCode, ProcedureQual, ProcedureCode, cd.Amount, Unit, Quantity, UnitRate, MEA, cd.PlaceOfService, Modifier1, Modifier2, Modifier3, Modifier4, NonCovered, ProcedureDescription, DiagPointer1, DiagPointer2, DiagPointer3, DiagPointer4, AdmitDiagnosis, PrincipalDiagnosis, Diag2, Diag3, Diag4, Diag5, Remark, PriorAuthNo, ApprovedAmount, cd.ApprovedProcedureCode, cd.ApprovedRevenueCode, cd.ApprovedUnits, cd.ApprovedUnitCode, DrugCode, DrugUnits, cd.RejectReason, AttendingProviderID, OperatingProviderID, RenderingProviderID, RendProvNPI, RefProvNPI, cd.FacilityID, cd.FacilityName, OrderingProviderID, ReferringProviderID, OtherPayer1AdjustmentReason1, OtherPayer1AdjustmentReason2, OtherPayer1AdjustmentReason3, OtherPayer1AdjustmentReason4, OtherPayer1AdjustmentAmount1, OtherPayer1AdjustmentAmount2, OtherPayer1AdjustmentAmount3, OtherPayer1AdjustmentAmount4, cd.OtherPayer2ID, OrigAppTransactionID, PatientMemberID, SubscriberMemberID, OtherInsuredID, OtherInsured2ID, OtherInsured2Last, OtherPayer2GroupName, OtherPayer2GroupNo, PatientFirst, PatientLast, ec.PayerResponsibility, ec.InsuranceType, PatientSex, PatientPaid
    FROM
        EDI_ClaimDetail cd
    JOIN
        EDI_Claims ec ON cd.ClaimID = ec.ID;
END$$

DELIMITER ;
