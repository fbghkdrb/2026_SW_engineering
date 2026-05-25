const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <span className="text-4xl">❌</span>
      <p className="text-sm text-red-500 font-semibold">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-wt-orange underline font-semibold hover:opacity-80 transition-opacity"
        >
          다시 시도
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;