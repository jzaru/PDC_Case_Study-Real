# Utility functions for the backend

def format_currency(value: float) -> str:
    """Format a number as currency"""
    return f"${value:,.2f}"


def format_percentage(value: float) -> str:
    """Format a number as percentage"""
    return f"{value:.2f}%"


def calculate_percentage_change(old_value: float, new_value: float) -> float:
    """
    Calculate percentage change between two values
    
    Args:
        old_value: Original value
        new_value: New value
        
    Returns:
        Percentage change
    """
    if old_value == 0:
        return 0
    
    return ((new_value - old_value) / old_value) * 100
