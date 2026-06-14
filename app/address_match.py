from rapidfuzz import fuzz


def calculate_match_score(
    gst_address,
    store_address
):

    score = fuzz.token_sort_ratio(
        gst_address.lower(),
        store_address.lower()
    )

    return round(score, 2)


def get_verification_status(
    score
):

    if score >= 90:
        return "VERIFIED"

    elif score >= 70:
        return "PARTIAL_MATCH"

    else:
        return "REVIEW_REQUIRED"