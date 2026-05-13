export function DessaLogo() {
  return (
    <div className="flex items-center gap-2">
      {/* Diamond / compass mark */}
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M13 1L17.5 8H22L17.5 13L22 18H17.5L13 25L8.5 18H4L8.5 13L4 8H8.5L13 1Z"
          fill="none"
          stroke="#1a4e8a"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M13 5L16 9H20L16 13L20 17H16L13 21L10 17H6L10 13L6 9H10L13 5Z"
          fill="#1a4e8a"
          opacity="0.15"
        />
        <circle cx="13" cy="13" r="2.5" fill="#1a4e8a" />
      </svg>
      <span
        className="text-[22px] font-bold tracking-widest"
        style={{ color: "#1a4e8a", fontFamily: "inherit", letterSpacing: "0.18em" }}
      >
        DESSA
      </span>
    </div>
  );
}
