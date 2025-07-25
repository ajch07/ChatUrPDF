def get_allowed_emails():
    with open("allowed_emails.txt", "r") as f:
        return [line.strip() for line in f if line.strip() and not line.startswith("#")]
