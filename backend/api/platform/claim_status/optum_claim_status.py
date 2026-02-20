from flask import Blueprint, request, jsonify
import logging
import os
import json
import requests
from datetime import datetime, date
from db import get_connection, close_connection


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

rebound_api_claim_status = Blueprint(
    "rebound_api_claim_status", __name__, url_prefix="/api/v1/rebound"
)
medevolve_api_claim_status = Blueprint(
    "medevolve_api_claim_status", __name__, url_prefix="/api/v1/medevolve"
)
pilotcustomer_api_claim_status = Blueprint(
    "pilotcustomer_api_claim_status", __name__, url_prefix="/api/v1/pilotcustomer"
)


def _parse_date(value):
    if not value:
        return None
    if isinstance(value, date):
        return value
    for fmt in ("%Y-%m-%d", "%Y%m%d"):
        try:
            return datetime.strptime(str(value), fmt).date()
        except ValueError:
            continue
    return None


def _to_csv(values):
    if not values:
        return None
    return ",".join([str(v) for v in values if v is not None])


def _map_insight_status(status_value):
    if not status_value:
        return None
    value = str(status_value).lower()
    if "accept" in value:
        return "Accepted"
    if "pending" in value:
        return "Pending"
    if "final" in value or "paid" in value:
        return "Finalized/Paid"
    if "denied" in value or "reject" in value:
        return "Denied/Rejected"
    return "Pending"


def _get_optum_token():
    client_id = os.getenv("OPTUM_CLIENT_ID")
    client_secret = os.getenv("OPTUM_CLIENT_SECRET")
    token_url = os.getenv(
        "OPTUM_TOKEN_URL", "https://sandbox-apigw.optum.com/apip/auth/v2/token"
    )
    if not client_id or not client_secret:
        raise ValueError("Missing OPTUM_CLIENT_ID or OPTUM_CLIENT_SECRET.")

    resp = requests.post(
        token_url,
        json={
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret,
        },
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        timeout=30,
    )
    resp.raise_for_status()
    payload = resp.json() or {}
    token = payload.get("access_token")
    if not token:
        raise ValueError("Optum token response missing access_token.")
    return token


def _call_optum_claim_status(payload):
    api_url = os.getenv(
        "OPTUM_CLAIM_STATUS_URL",
        "https://sandbox-apigw.optum.com/medicalnetwork/claimstatus/v2/",
    )
    token = _get_optum_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    resp = requests.post(api_url, json=payload, headers=headers, timeout=60)
    resp.raise_for_status()
    return resp.json() if resp.content else {}


def _insert_request(cursor, payload):
    subscriber = payload.get("subscriber") or {}
    dependent = payload.get("dependent") or {}

    cursor.execute(
        """
        INSERT INTO optum_claim_status_request (
          control_number,
          trading_partner_name,
          trading_partner_service_id,
          subscriber_member_id,
          subscriber_first_name,
          subscriber_last_name,
          subscriber_gender,
          subscriber_dob,
          dependent_first_name,
          dependent_last_name,
          dependent_gender,
          dependent_dob,
          group_number,
          raw_json,
          raw_x12
        ) VALUES (
          %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
        """,
        (
            payload.get("controlNumber"),
            payload.get("tradingPartnerName"),
            payload.get("tradingPartnerServiceId"),
            subscriber.get("memberId"),
            subscriber.get("firstName"),
            subscriber.get("lastName"),
            subscriber.get("gender"),
            _parse_date(subscriber.get("dateOfBirth")),
            dependent.get("firstName"),
            dependent.get("lastName"),
            dependent.get("gender"),
            _parse_date(dependent.get("dateOfBirth")),
            subscriber.get("groupNumber") or dependent.get("groupNumber"),
            json.dumps(payload),
            payload.get("x12"),
        ),
    )
    request_id = cursor.lastrowid

    for provider in payload.get("providers") or []:
        cursor.execute(
            """
            INSERT INTO optum_claim_status_request_provider (
              request_id,
              provider_type,
              organization_name,
              first_name,
              last_name,
              npi,
              spn,
              tin,
              tax_id,
              etin
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                request_id,
                provider.get("providerType"),
                provider.get("organizationName"),
                provider.get("firstName"),
                provider.get("lastName"),
                provider.get("npi"),
                provider.get("spn"),
                provider.get("tin"),
                provider.get("taxId"),
                provider.get("etin"),
            ),
        )

    encounter = payload.get("encounter") or {}
    if encounter:
        cursor.execute(
            """
            INSERT INTO optum_claim_status_request_encounter (
              request_id,
              beginning_date_of_service,
              end_date_of_service,
              tracking_number,
              trading_partner_claim_number,
              location_identifier,
              billing_type,
              patient_account_number,
              pharmacy_prescription_number,
              clearing_house_claim_number,
              submitted_amount
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                request_id,
                _parse_date(encounter.get("beginningDateOfService")),
                _parse_date(encounter.get("endDateOfService")),
                encounter.get("trackingNumber"),
                encounter.get("tradingPartnerClaimNumber"),
                encounter.get("locationIdentifier"),
                encounter.get("billingType"),
                encounter.get("patientAccountNumber"),
                encounter.get("pharmacyPrescriptionNumber"),
                encounter.get("clearingHouseClaimNumber"),
                encounter.get("submittedAmount"),
            ),
        )

    service_line = payload.get("serviceLineInformation") or {}
    if service_line:
        cursor.execute(
            """
            INSERT INTO optum_claim_status_request_service_line (
              request_id,
              product_or_service_id_qualifier,
              procedure_code,
              procedure_modifiers,
              line_item_charge_amount,
              revenue_code,
              units_of_service_count,
              line_item_control_number,
              service_line_date,
              service_line_end_date
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                request_id,
                service_line.get("productOrServiceIDQualifier"),
                service_line.get("procedureCode"),
                _to_csv(service_line.get("procedureModifiers")),
                service_line.get("lineItemChargeAmount"),
                service_line.get("revenueCode"),
                service_line.get("unitsOfServiceCount"),
                service_line.get("lineItemControlNumber"),
                _parse_date(service_line.get("serviceLineDate")),
                _parse_date(service_line.get("serviceLineEndDate")),
            ),
        )

    return request_id


def _insert_response(cursor, request_id, response):
    cursor.execute(
        """
        INSERT INTO optum_claim_status_response (
          request_id,
          control_number,
          trading_partner_service_id,
          status,
          reassociation_key,
          transaction_set_acknowledgement,
          implementation_transaction_set_syntax_error,
          x12,
          raw_json
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            request_id,
            response.get("controlNumber"),
            response.get("tradingPartnerServiceId"),
            response.get("status"),
            response.get("reassociationKey"),
            response.get("transactionSetAcknowledgement"),
            response.get("implementationTransactionSetSyntaxError"),
            response.get("x12"),
            json.dumps(response),
        ),
    )
    response_id = cursor.lastrowid

    payer = response.get("payer") or {}
    if payer:
        contact = payer.get("contactInformation") or {}
        cursor.execute(
            """
            INSERT INTO optum_claim_status_response_payer (
              response_id,
              organization_name,
              payer_identification,
              cms_plan_id,
              contact_name,
              contact_electronic_data_interchange_access_number,
              contact_email,
              contact_fax,
              contact_phone,
              contact_phone_extension
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                response_id,
                payer.get("organizationName"),
                payer.get("payerIdentification"),
                payer.get("centersForMedicareAndMedicaidServicePlanId"),
                contact.get("name"),
                contact.get("electronicDataInterChangeAccessNumber"),
                contact.get("email"),
                contact.get("fax"),
                contact.get("phone"),
                contact.get("phoneExtension"),
            ),
        )

    for provider in response.get("providers") or []:
        cursor.execute(
            """
            INSERT INTO optum_claim_status_response_provider (
              response_id,
              provider_type,
              organization_name,
              first_name,
              last_name,
              npi,
              spn,
              tin,
              tax_id,
              etin
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                response_id,
                provider.get("providerType"),
                provider.get("organizationName"),
                provider.get("firstName"),
                provider.get("lastName"),
                provider.get("npi"),
                provider.get("spn"),
                provider.get("tin"),
                provider.get("taxId"),
                provider.get("etin"),
            ),
        )

    subscriber = response.get("subscriber") or {}
    if subscriber:
        cursor.execute(
            """
            INSERT INTO optum_claim_status_response_member (
              response_id,
              role,
              member_id,
              first_name,
              last_name,
              gender,
              date_of_birth,
              group_number
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                response_id,
                "subscriber",
                subscriber.get("memberId"),
                subscriber.get("firstName"),
                subscriber.get("lastName"),
                subscriber.get("gender"),
                _parse_date(subscriber.get("dateOfBirth")),
                subscriber.get("groupNumber"),
            ),
        )

    dependent = response.get("dependent") or {}
    if dependent:
        cursor.execute(
            """
            INSERT INTO optum_claim_status_response_member (
              response_id,
              role,
              member_id,
              first_name,
              last_name,
              gender,
              date_of_birth,
              group_number
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                response_id,
                "dependent",
                dependent.get("memberId"),
                dependent.get("firstName"),
                dependent.get("lastName"),
                dependent.get("gender"),
                _parse_date(dependent.get("dateOfBirth")),
                dependent.get("groupNumber"),
            ),
        )

    for index, claim in enumerate(response.get("claims") or []):
        claim_status = claim.get("claimStatus") or {}
        status_label = (
            claim_status.get("statusCategoryCodeValue")
            or claim_status.get("statusCodeValue")
            or ""
        )
        insight_status = _map_insight_status(status_label)
        cursor.execute(
            """
            INSERT INTO optum_claim_status_claim (
              response_id,
              claim_index,
              status_category_code,
              status_category_code_value,
              status_code,
              status_code_value,
              entity_code,
              entity,
              effective_date,
              submitted_amount,
              amount_paid,
              paid_date,
              check_issue_date,
              check_number,
              tracking_number,
              claim_service_date,
              trading_partner_claim_number,
              patient_account_number,
              clearing_house_claim_number,
              insight_status
            ) VALUES (
              %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            """,
            (
                response_id,
                index,
                claim_status.get("statusCategoryCode"),
                claim_status.get("statusCategoryCodeValue"),
                claim_status.get("statusCode"),
                claim_status.get("statusCodeValue"),
                claim_status.get("entityCode"),
                claim_status.get("entity"),
                _parse_date(claim_status.get("effectiveDate")),
                claim_status.get("submittedAmount"),
                claim_status.get("amountPaid"),
                _parse_date(claim_status.get("paidDate")),
                _parse_date(claim_status.get("checkIssueDate")),
                claim_status.get("checkNumber"),
                claim_status.get("trackingNumber"),
                _parse_date(claim_status.get("claimServiceDate")),
                claim_status.get("tradingPartnerClaimNumber"),
                claim_status.get("patientAccountNumber"),
                claim_status.get("clearingHouseClaimNumber"),
                insight_status,
            ),
        )
        claim_id = cursor.lastrowid

        for detail in claim.get("serviceDetails") or []:
            service = detail.get("service") or {}
            cursor.execute(
                """
                INSERT INTO optum_claim_status_service (
                  claim_id,
                  service_id_qualifier_code,
                  service_id_qualifier,
                  procedure_id,
                  submitted_amount,
                  amount_paid,
                  revenue_code,
                  submitted_units
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    claim_id,
                    service.get("serviceIdQualifierCode"),
                    service.get("serviceIdQualifier"),
                    service.get("procedureId"),
                    service.get("submittedAmount"),
                    service.get("amountPaid"),
                    service.get("revenueCode"),
                    service.get("submittedUnits"),
                ),
            )
            service_id = cursor.lastrowid

            for status in detail.get("status") or []:
                cursor.execute(
                    """
                    INSERT INTO optum_claim_status_service_status (
                      service_id,
                      status_category_code,
                      status_category_code_value,
                      status_code,
                      status_code_value,
                      entity_code,
                      entity,
                      effective_date
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        service_id,
                        status.get("statusCategoryCode"),
                        status.get("statusCategoryCodeValue"),
                        status.get("statusCode"),
                        status.get("statusCodeValue"),
                        status.get("entityCode"),
                        status.get("entity"),
                        _parse_date(status.get("effectiveDate")),
                    ),
                )

    error = response.get("errorResponse") or {}
    if error:
        tx = error.get("transactionIdentifier") or {}
        cursor.execute(
            """
            INSERT INTO optum_claim_status_error (
              response_id,
              code,
              description,
              customer_transaction_id,
              transaction_id
            ) VALUES (%s, %s, %s, %s, %s)
            """,
            (
                response_id,
                error.get("code"),
                error.get("description"),
                tx.get("customerTransactionId"),
                tx.get("transactionId"),
            ),
        )
        error_id = cursor.lastrowid
        for detail in error.get("errors") or []:
            cursor.execute(
                """
                INSERT INTO optum_claim_status_error_detail (
                  error_id,
                  field,
                  value,
                  code,
                  description,
                  location,
                  followup_action
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    error_id,
                    detail.get("field"),
                    detail.get("value"),
                    detail.get("code"),
                    detail.get("description"),
                    detail.get("location"),
                    detail.get("followupAction"),
                ),
            )

    meta = response.get("meta") or {}
    if meta:
        cursor.execute(
            """
            INSERT INTO optum_claim_status_meta (
              response_id,
              submitter_id,
              sender_id,
              biller_id,
              trace_id,
              application_mode
            ) VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                response_id,
                meta.get("submitterId"),
                meta.get("senderId"),
                meta.get("billerId"),
                meta.get("traceId"),
                meta.get("applicationMode"),
            ),
        )

    return response_id


@rebound_api_claim_status.route("/claim-status/optum", methods=["POST"])
@medevolve_api_claim_status.route("/claim-status/optum", methods=["POST"])
@pilotcustomer_api_claim_status.route("/claim-status/optum", methods=["POST"])
def claim_status_optum():
    if not request.is_json:
        return (
            jsonify({"error": "Unsupported Media Type: Content-Type must be application/json"}),
            415,
        )

    payload = request.get_json(silent=True) or {}
    conn = None
    cursor = None
    try:
        conn, cursor, _ = get_connection(request.base_url)

        request_id = _insert_request(cursor, payload)
        response = _call_optum_claim_status(payload)
        response_id = _insert_response(cursor, request_id, response)

        conn.commit()
        return jsonify(
            {
                "requestId": request_id,
                "responseId": response_id,
                "response": response,
            }
        ), 200
    except requests.HTTPError as exc:
        logger.error("Optum API error: %s", exc)
        if conn:
            conn.rollback()
        return jsonify({"error": "Optum API error", "detail": str(exc)}), 502
    except Exception as exc:
        logger.error("Claim status error: %s", exc)
        if conn:
            conn.rollback()
        return jsonify({"error": "Failed to process claim status", "detail": str(exc)}), 500
    finally:
        close_connection(cursor, conn)


@rebound_api_claim_status.route("/claim-status/optum/bulk", methods=["POST"])
@medevolve_api_claim_status.route("/claim-status/optum/bulk", methods=["POST"])
@pilotcustomer_api_claim_status.route("/claim-status/optum/bulk", methods=["POST"])
def claim_status_optum_bulk():
    if not request.is_json:
        return (
            jsonify({"error": "Unsupported Media Type: Content-Type must be application/json"}),
            415,
        )

    payload = request.get_json(silent=True) or {}
    requests_payload = payload.get("requests") or []
    if not isinstance(requests_payload, list) or len(requests_payload) == 0:
        return jsonify({"error": "requests must be a non-empty array"}), 400

    conn = None
    cursor = None
    results = []
    success_count = 0
    failure_count = 0

    try:
        conn, cursor, _ = get_connection(request.base_url)

        for idx, req_payload in enumerate(requests_payload):
            try:
                request_id = _insert_request(cursor, req_payload)
                response = _call_optum_claim_status(req_payload)
                response_id = _insert_response(cursor, request_id, response)
                conn.commit()
                results.append(
                    {
                        "index": idx,
                        "requestId": request_id,
                        "responseId": response_id,
                        "status": "ok",
                    }
                )
                success_count += 1
            except Exception as item_exc:
                failure_count += 1
                conn.rollback()
                results.append(
                    {
                        "index": idx,
                        "status": "error",
                        "error": str(item_exc),
                    }
                )

        return (
            jsonify(
                {
                    "results": results,
                    "successCount": success_count,
                    "failureCount": failure_count,
                }
            ),
            200,
        )
    except Exception as exc:
        logger.error("Bulk claim status error: %s", exc)
        if conn:
            conn.rollback()
        return jsonify({"error": "Failed to process bulk claim status", "detail": str(exc)}), 500
    finally:
        close_connection(cursor, conn)
