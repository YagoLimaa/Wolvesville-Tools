export interface ApiError {
  status: number;
  message: string;
  isNetworkError: boolean;
  isValidationError: boolean;
}

export function parseApiError(error: unknown, defaultMessage: string = 'An error occurred'): ApiError {
  if (error instanceof TypeError) {
    return {
      status: 0,
      message: 'Network connection failed. Please check your internet.',
      isNetworkError: true,
      isValidationError: false,
    };
  }

  if (error instanceof Error) {
    return {
      status: 0,
      message: error.message,
      isNetworkError: false,
      isValidationError: error.message.includes('validation') || error.message.includes('invalid'),
    };
  }

  return {
    status: 0,
    message: defaultMessage,
    isNetworkError: false,
    isValidationError: false,
  };
}

export function getErrorMessage(error: unknown, t?: (key: string, defaults?: string) => string): string {
  const apiError = parseApiError(error);

  if (t) {
    if (apiError.isNetworkError) {
      return t('error.network', 'Network error. Please try again.');
    }
    if (apiError.isValidationError) {
      return t('error.validation', 'Invalid input. Please check your data.');
    }
    return t('error.general', apiError.message);
  }

  return apiError.message;
}

export function formatErrors(errors: unknown[]): string[] {
  return errors.map((error) => {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    return 'Unknown error';
  });
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;

      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}
