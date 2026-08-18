class AlphaVantageException(Exception):
    """Base exception for Alpha Vantage Provider."""
    pass

class AlphaVantageAPIError(AlphaVantageException):
    """Raised when Alpha Vantage API returns an error."""
    pass
