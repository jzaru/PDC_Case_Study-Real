import pandas as pd
import numpy as np
from multiprocessing import Pool, cpu_count
from typing import List, Dict, Tuple
import os


def load_csv_data(csv_path: str) -> pd.DataFrame:
    """
    Load stock data from CSV file
    
    Args:
        csv_path: Path to the CSV file
        
    Returns:
        DataFrame with stock data
    """
    try:
        df = pd.read_csv(csv_path)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        return df
    except Exception as e:
        print(f"Error loading CSV: {e}")
        return pd.DataFrame()


def process_stock_chunk(chunk_data: Tuple[str, pd.DataFrame]) -> Dict:
    """
    Process a chunk of stock data for a single symbol
    Used for parallel processing via multiprocessing
    
    Args:
        chunk_data: Tuple of (symbol, dataframe chunk)
        
    Returns:
        Dictionary with analysis results
    """
    symbol, df = chunk_data
    
    if df.empty:
        return {
            'symbol': symbol,
            'records': 0,
            'avg_price': 0,
            'volatility': 0,
            'price_range': (0, 0)
        }
    
    # Calculate statistics
    avg_price = df['close'].mean()
    volatility = df['close'].std()
    price_min = df['close'].min()
    price_max = df['close'].max()
    
    return {
        'symbol': symbol,
        'records': len(df),
        'avg_price': avg_price,
        'volatility': volatility,
        'price_range': (price_min, price_max),
        'latest_price': df.iloc[-1]['close'] if len(df) > 0 else 0
    }


def analyze_stocks_parallel(df: pd.DataFrame) -> Dict[str, Dict]:
    """
    Analyze stock data using parallel processing (multiprocessing)
    Demonstrates distributed computing by processing each stock in parallel
    
    Args:
        df: DataFrame with stock data
        
    Returns:
        Dictionary with analysis results for all stocks
    """
    if df.empty:
        return {}
    
    # Group data by stock symbol
    grouped = [(symbol, group) for symbol, group in df.groupby('symbol')]
    
    # Use multiprocessing to process chunks in parallel
    num_processes = min(cpu_count(), len(grouped))
    
    with Pool(processes=num_processes) as pool:
        results = pool.map(process_stock_chunk, grouped)
    
    # Convert list of results to dictionary
    analysis_dict = {result['symbol']: result for result in results}
    return analysis_dict


def calculate_moving_average(df: pd.DataFrame, symbol: str, window: int = 10) -> List[float]:
    """
    Calculate moving average for a stock symbol
    
    Args:
        df: DataFrame with stock data
        symbol: Stock symbol
        window: Window size for moving average
        
    Returns:
        List of moving average values
    """
    stock_data = df[df['symbol'] == symbol].sort_values('timestamp')
    
    if len(stock_data) < window:
        return []
    
    return stock_data['close'].rolling(window=window).mean().tolist()


def calculate_volatility(df: pd.DataFrame, symbol: str, window: int = 20) -> float:
    """
    Calculate volatility (standard deviation) for a stock
    
    Args:
        df: DataFrame with stock data
        symbol: Stock symbol
        window: Window size for volatility calculation
        
    Returns:
        Volatility value
    """
    stock_data = df[df['symbol'] == symbol].sort_values('timestamp')
    
    if len(stock_data) < window:
        return stock_data['close'].std()
    
    return stock_data['close'].rolling(window=window).std().mean()


def get_latest_price(df: pd.DataFrame, symbol: str) -> Tuple[float, str]:
    """
    Get the latest price for a stock
    
    Args:
        df: DataFrame with stock data
        symbol: Stock symbol
        
    Returns:
        Tuple of (price, date)
    """
    stock_data = df[df['symbol'] == symbol].sort_values('timestamp')
    
    if stock_data.empty:
        return 0, ""
    
    latest = stock_data.iloc[-1]
    return latest['close'], str(latest['timestamp'].date())


def batch_process_analysis(csv_path: str) -> Dict:
    """
    Main function to load and process all stock data
    Demonstrates batch processing and parallel computing
    
    Args:
        csv_path: Path to CSV file
        
    Returns:
        Dictionary with analysis results
    """
    df = load_csv_data(csv_path)
    
    if df.empty:
        return {}
    
    # Run parallel analysis
    analysis = analyze_stocks_parallel(df)
    
    # Add additional metrics
    for symbol in analysis:
        ma_10 = calculate_moving_average(df, symbol, 10)
        ma_20 = calculate_moving_average(df, symbol, 20)
        volatility = calculate_volatility(df, symbol, 20)
        price, date = get_latest_price(df, symbol)
        
        analysis[symbol].update({
            'moving_avg_10': ma_10[-1] if ma_10 else price,
            'moving_avg_20': ma_20[-1] if ma_20 else price,
            'volatility': volatility,
            'current_date': date
        })
    
    return analysis
