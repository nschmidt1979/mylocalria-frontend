

const StarRating = ({ rating = 0, outOf = 5, className = '', size = 8 }) => {
  const stars = [];
  for (let i = 1; i <= outOf; i++) {
    stars.push(
      <span
        key={i}
        className={`inline-flex items-center justify-center w-${size} h-${size} bg-red-500 rounded-md mr-1 last:mr-0`}
        style={{ opacity: i <= rating ? 1 : 0.3 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 20 20" className={`w-${size - 3} h-${size - 3}`}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
        </svg>
      </span>
    );
  }
  return <div className={`flex ${className}`}>{stars}</div>;
};

export default StarRating; 