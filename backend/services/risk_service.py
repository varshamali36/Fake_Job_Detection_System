import re
from typing import Dict, List, Any

# Centralized configuration dictionary for all risk scoring rules (no scattered magic numbers)
RISK_RULES_CONFIG = {
    "BASE_MODEL_WEIGHT": 50.0,  # ML fake_prob (0.0 to 1.0) maps to 0-50 base score
    "RULES": {
        "SUSPICIOUS_KEYWORDS": {
            "max_penalty": 25.0,
            "keywords": [
                "registration fee", "security deposit", "pay to apply", "application fee",
                "work from home earn daily", "no experience needed high salary", "urgent hiring",
                "wire transfer", "bitcoin", "crypto", "telegram", "whatsapp", "re-shipping",
                "mystery shopper", "bank transfer", "cashing check", "easy cash"
            ],
            "factor_name": "Suspicious Keywords Detected",
            "explanation": "Job posting contains financial or communication phrases frequently associated with recruitment fraud."
        },
        "SALARY_EXPERIENCE_ANOMALY": {
            "penalty": 15.0,
            "suspicious_salary_tokens": ["$5000/week", "$1000/day", "200000", "300000", "$5,000/week", "$1,000/day"],
            "entry_level_tokens": ["entry level", "no experience", "high school"],
            "factor_name": "Salary vs. Experience Anomaly",
            "explanation": "Unrealistic high compensation structure advertised for entry-level or no-experience position."
        },
        "MISSING_COMPANY_PROFILE": {
            "missing_penalty": 10.0,
            "short_penalty": 5.0,
            "min_profile_length": 60,
            "factor_name": "Incomplete Company Profile",
            "explanation": "Company background information is absent or minimal."
        },
        "FREEMAIL_CONTACT": {
            "penalty": 10.0,
            "freemail_domains": ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "aol.com", "icloud.com"],
            "factor_name": "Free Public Mail Contact Domain",
            "explanation": "Contact email relies on a free webmail domain instead of a verified corporate domain."
        },
        "MISSING_COMPANY_LOGO": {
            "penalty": 5.0,
            "factor_name": "Missing Verified Logo",
            "explanation": "No corporate logo or verified branding asset attached to posting."
        },
        "SHORT_DESCRIPTION": {
            "penalty": 10.0,
            "min_desc_length": 120,
            "factor_name": "Abnormally Brief Job Description",
            "explanation": "Job description is unusually short and lacks role duties or expectations."
        }
    },
    "POSITIVE_INDICATORS": {
        "DETAILED_PROFILE": "Substantial corporate overview and verifiable company profile provided.",
        "COMPREHENSIVE_REQUIREMENTS": "Clear educational and experience requirements specified.",
        "VERIFIED_LOGO": "Verified corporate logo attached to job posting.",
        "FULL_TIME_BENEFITS": "Detailed compensation and corporate benefit package outlined.",
        "MODEL_GENUINE_CONFIDENCE": "Machine learning model evaluated text structure as consistent with genuine job ads."
    }
}

def evaluate_risk(job_data: dict, ml_result: dict) -> dict:
    """
    Computes rule-based risk score (0-100), risk level, structured risk factors, and positive indicators.
    """
    fake_prob = float(ml_result.get("raw_fake_prob", 0.5))
    
    # Base score from ML model fake probability (0 to 50 points)
    base_score = fake_prob * RISK_RULES_CONFIG["BASE_MODEL_WEIGHT"]
    
    risk_score = base_score
    risk_factors: List[Dict[str, Any]] = []
    positive_indicators: List[str] = []

    # Extract job text fields
    title = str(job_data.get("title", "") or "").lower()
    comp_profile = str(job_data.get("company_profile", "") or "").strip()
    description = str(job_data.get("description", "") or "").strip()
    requirements = str(job_data.get("requirements", "") or "").strip()
    benefits = str(job_data.get("benefits", "") or "").strip()
    salary = str(job_data.get("salary_range", "") or "").lower()
    exp = str(job_data.get("required_experience", "") or "").lower()
    has_logo = bool(job_data.get("has_company_logo", False))

    combined_text = f"{title} {comp_profile.lower()} {description.lower()} {requirements.lower()} {benefits.lower()}"

    # Rule 1: Suspicious Keywords
    kw_config = RISK_RULES_CONFIG["RULES"]["SUSPICIOUS_KEYWORDS"]
    matched_kws = [kw for kw in kw_config["keywords"] if kw in combined_text]
    if matched_kws:
        penalty = min(len(matched_kws) * 8.0, kw_config["max_penalty"])
        risk_score += penalty
        risk_factors.append({
            "factor": kw_config["factor_name"],
            "points": round(penalty, 1),
            "explanation": f"{kw_config['explanation']} Found terms: {', '.join(matched_kws)}."
        })

    # Rule 2: Salary vs. Experience Anomaly
    sal_config = RISK_RULES_CONFIG["RULES"]["SALARY_EXPERIENCE_ANOMALY"]
    has_high_sal = any(tok in salary for tok in sal_config["suspicious_salary_tokens"])
    is_entry = any(tok in exp for tok in sal_config["entry_level_tokens"]) or "no experience" in combined_text
    if has_high_sal and is_entry:
        penalty = sal_config["penalty"]
        risk_score += penalty
        risk_factors.append({
            "factor": sal_config["factor_name"],
            "points": round(penalty, 1),
            "explanation": sal_config["explanation"]
        })

    # Rule 3: Missing or Short Company Profile
    prof_config = RISK_RULES_CONFIG["RULES"]["MISSING_COMPANY_PROFILE"]
    if not comp_profile:
        penalty = prof_config["missing_penalty"]
        risk_score += penalty
        risk_factors.append({
            "factor": prof_config["factor_name"],
            "points": round(penalty, 1),
            "explanation": "No company profile or corporate overview was provided."
        })
    elif len(comp_profile) < prof_config["min_profile_length"]:
        penalty = prof_config["short_penalty"]
        risk_score += penalty
        risk_factors.append({
            "factor": prof_config["factor_name"],
            "points": round(penalty, 1),
            "explanation": f"Company profile is extremely brief ({len(comp_profile)} characters)."
        })
    else:
        positive_indicators.append(RISK_RULES_CONFIG["POSITIVE_INDICATORS"]["DETAILED_PROFILE"])

    # Rule 4: Freemail Contact Domain
    free_config = RISK_RULES_CONFIG["RULES"]["FREEMAIL_CONTACT"]
    emails = re.findall(r'[\w\.-]+@[\w\.-]+', combined_text)
    freemail_found = [e for e in emails if any(dom in e for dom in free_config["freemail_domains"])]
    if freemail_found:
        penalty = free_config["penalty"]
        risk_score += penalty
        risk_factors.append({
            "factor": free_config["factor_name"],
            "points": round(penalty, 1),
            "explanation": f"{free_config['explanation']} Identified contact: {', '.join(freemail_found)}."
        })

    # Rule 5: Missing Logo
    logo_config = RISK_RULES_CONFIG["RULES"]["MISSING_COMPANY_LOGO"]
    if not has_logo:
        penalty = logo_config["penalty"]
        risk_score += penalty
        risk_factors.append({
            "factor": logo_config["factor_name"],
            "points": round(penalty, 1),
            "explanation": logo_config["explanation"]
        })
    else:
        positive_indicators.append(RISK_RULES_CONFIG["POSITIVE_INDICATORS"]["VERIFIED_LOGO"])

    # Rule 6: Short Description
    desc_config = RISK_RULES_CONFIG["RULES"]["SHORT_DESCRIPTION"]
    if len(description) < desc_config["min_desc_length"]:
        penalty = desc_config["penalty"]
        risk_score += penalty
        risk_factors.append({
            "factor": desc_config["factor_name"],
            "points": round(penalty, 1),
            "explanation": f"Job description contains only {len(description)} characters."
        })

    # Additional Positive Indicators
    if len(requirements) > 80:
        positive_indicators.append(RISK_RULES_CONFIG["POSITIVE_INDICATORS"]["COMPREHENSIVE_REQUIREMENTS"])
    if len(benefits) > 50:
        positive_indicators.append(RISK_RULES_CONFIG["POSITIVE_INDICATORS"]["FULL_TIME_BENEFITS"])
    if fake_prob < 0.35:
        positive_indicators.append(RISK_RULES_CONFIG["POSITIVE_INDICATORS"]["MODEL_GENUINE_CONFIDENCE"])

    # Cap risk score at 100.0 max
    final_risk_score = round(min(max(risk_score, 0.0), 100.0), 2)

    # Determine Risk Level
    if final_risk_score <= 30.0:
        risk_level = "Low"
    elif final_risk_score <= 60.0:
        risk_level = "Medium"
    else:
        risk_level = "High"

    return {
        "risk_score": final_risk_score,
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "positive_indicators": positive_indicators
    }
