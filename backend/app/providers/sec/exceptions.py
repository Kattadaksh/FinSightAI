class SECProviderException(Exception):
    """Base exception for SEC Provider."""
    pass

class SECAPIError(SECProviderException):
    """Raised when the SEC API returns an error."""
    pass
