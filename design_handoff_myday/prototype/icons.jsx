// SF Symbols-style filled icons. Inline SVG, currentColor.
// Sized via fontSize / wrap with width on parent; default 24.

const Icon = ({ d, size = 24, color = 'currentColor', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <path d={d} fill={color} />
  </svg>
);

// Today / sun
const IconToday = (p) => (
  <Icon {...p} d="M12 4a1 1 0 0 1 1 1v1.5a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1Zm6.36 2.64a1 1 0 0 1 0 1.41l-1.06 1.06a1 1 0 1 1-1.41-1.41l1.06-1.06a1 1 0 0 1 1.41 0ZM5.64 6.64a1 1 0 0 1 1.41 0l1.06 1.06a1 1 0 1 1-1.41 1.41L5.64 8.05a1 1 0 0 1 0-1.41ZM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM4 12a1 1 0 0 1 1-1h1.5a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Zm13.5-1H19a1 1 0 1 1 0 2h-1.5a1 1 0 1 1 0-2ZM7.05 15.54a1 1 0 0 1 0 1.41L6 18a1 1 0 1 1-1.41-1.41l1.05-1.05a1 1 0 0 1 1.41 0Zm9.9 0a1 1 0 0 1 1.41 0L19.41 16.6A1 1 0 1 1 18 18l-1.05-1.05a1 1 0 0 1 0-1.41ZM12 17.5a1 1 0 0 1 1 1V20a1 1 0 1 1-2 0v-1.5a1 1 0 0 1 1-1Z" />
);

// Checkmark in circle
const IconChecklist = (p) => (
  <Icon {...p} d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.7 7.7-5.4 5.4a1 1 0 0 1-1.4 0L7.3 12.5a1 1 0 1 1 1.4-1.4L10.6 13l4.7-4.7a1 1 0 1 1 1.4 1.4Z" />
);

// Wallet
const IconWallet = (p) => (
  <Icon {...p} d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5V7H5v-.5ZM3 9.5C3 8.67 3.67 8 4.5 8h15c.83 0 1.5.67 1.5 1.5V11h-3.5a3 3 0 0 0 0 6H21v1.5c0 .83-.67 1.5-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5v-9ZM21 12.5V15.5h-3.5a1.5 1.5 0 0 1 0-3H21Zm-4.25 1a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z" />
);

// Settings (gear)
const IconSettings = (p) => (
  <Icon {...p} d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm9.4-3.13-1.65-.55a8 8 0 0 0-.5-1.21l.78-1.55a1 1 0 0 0-.18-1.16l-1.25-1.25a1 1 0 0 0-1.16-.18l-1.55.78a8 8 0 0 0-1.21-.5l-.55-1.65A1 1 0 0 0 13.18 2h-2.36a1 1 0 0 0-.95.68l-.55 1.65a8 8 0 0 0-1.21.5l-1.55-.78a1 1 0 0 0-1.16.18L4.15 5.48a1 1 0 0 0-.18 1.16l.78 1.55a8 8 0 0 0-.5 1.21l-1.65.55a1 1 0 0 0-.68.95v2.36a1 1 0 0 0 .68.95l1.65.55a8 8 0 0 0 .5 1.21l-.78 1.55a1 1 0 0 0 .18 1.16l1.25 1.25a1 1 0 0 0 1.16.18l1.55-.78a8 8 0 0 0 1.21.5l.55 1.65a1 1 0 0 0 .95.68h2.36a1 1 0 0 0 .95-.68l.55-1.65a8 8 0 0 0 1.21-.5l1.55.78a1 1 0 0 0 1.16-.18l1.25-1.25a1 1 0 0 0 .18-1.16l-.78-1.55a8 8 0 0 0 .5-1.21l1.65-.55a1 1 0 0 0 .68-.95v-2.36a1 1 0 0 0-.68-.95Z" />
);

// Plus
const IconPlus = (p) => (
  <Icon {...p} d="M12 4a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6V5a1 1 0 0 1 1-1Z" />
);

// Check
const IconCheck = (p) => (
  <Icon {...p} d="M20.3 6.3a1 1 0 0 1 0 1.4l-10 10a1 1 0 0 1-1.4 0l-5-5a1 1 0 1 1 1.4-1.4l4.3 4.3 9.3-9.3a1 1 0 0 1 1.4 0Z" />
);

// Trash
const IconTrash = (p) => (
  <Icon {...p} d="M9 3a1 1 0 0 0-1 1v1H4a1 1 0 1 0 0 2h.7l.9 12.1A2 2 0 0 0 7.6 21h8.8a2 2 0 0 0 2-1.9L19.3 7H20a1 1 0 1 0 0-2h-4V4a1 1 0 0 0-1-1H9Zm1 4a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0V8a1 1 0 0 1 1-1Zm4 0a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0V8a1 1 0 0 1 1-1Z" />
);

// Chevron right
const IconChevronRight = (p) => (
  <Icon {...p} d="M9.3 6.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 1 1-1.4-1.4L13.6 12 9.3 7.7a1 1 0 0 1 0-1.4Z" />
);

// Chevron down
const IconChevronDown = (p) => (
  <Icon {...p} d="M6.3 9.3a1 1 0 0 1 1.4 0L12 13.6l4.3-4.3a1 1 0 1 1 1.4 1.4l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 0 1 0-1.4Z" />
);

// Close (x)
const IconClose = (p) => (
  <Icon {...p} d="M6.3 6.3a1 1 0 0 1 1.4 0L12 10.6l4.3-4.3a1 1 0 1 1 1.4 1.4L13.4 12l4.3 4.3a1 1 0 0 1-1.4 1.4L12 13.4l-4.3 4.3a1 1 0 1 1-1.4-1.4L10.6 12 6.3 7.7a1 1 0 0 1 0-1.4Z" />
);

// Calendar
const IconCalendar = (p) => (
  <Icon {...p} d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 22 6.5V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6.5A2.5 2.5 0 0 1 4.5 4H6V3a1 1 0 0 1 1-1Zm-3 8v10h16V10H4Z" />
);

// Tag
const IconTag = (p) => (
  <Icon {...p} d="M3 5a2 2 0 0 1 2-2h6.17a2 2 0 0 1 1.41.59l8.83 8.82a2 2 0 0 1 0 2.83l-6.17 6.17a2 2 0 0 1-2.83 0L3.59 12.6A2 2 0 0 1 3 11.17V5Zm4 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
);

// Bell
const IconBell = (p) => (
  <Icon {...p} d="M12 2a6 6 0 0 0-6 6v3.7l-1.7 2.83A1 1 0 0 0 5.16 16h13.68a1 1 0 0 0 .86-1.47L18 11.7V8a6 6 0 0 0-6-6Zm-2 16a2 2 0 1 0 4 0h-4Z" />
);

// Repeat
const IconRepeat = (p) => (
  <Icon {...p} d="M7 4a1 1 0 0 1 1 1v1h9a3 3 0 0 1 3 3v3a1 1 0 1 1-2 0V9a1 1 0 0 0-1-1H8v1a1 1 0 0 1-1.7.7l-3-3a1 1 0 0 1 0-1.4l3-3A1 1 0 0 1 7 4Zm10 9a1 1 0 0 1 .7 1.7l3 3a1 1 0 0 1 0 1.4l-3 3A1 1 0 0 1 16 21v-1H7a3 3 0 0 1-3-3v-3a1 1 0 1 1 2 0v3a1 1 0 0 0 1 1h9v-1a1 1 0 0 1 1-1Z" />
);

// Flag (priority)
const IconFlag = (p) => (
  <Icon {...p} d="M5 3a1 1 0 0 1 1 1v.5l1.5-.4a8 8 0 0 1 5.5.6 6 6 0 0 0 4.5.4l1.7-.5A1 1 0 0 1 20.5 5v8.6a1 1 0 0 1-.7 1l-1.7.5a8 8 0 0 1-6 0 6 6 0 0 0-4.1-.3L6 15.3V21a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Z" />
);

// Note (text lines)
const IconNote = (p) => (
  <Icon {...p} d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Zm2 5h10a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2Zm0 4h10a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2Zm0 4h6a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2Z" />
);

// Search
const IconSearch = (p) => (
  <Icon {...p} d="M10.5 3a7.5 7.5 0 1 1-4.6 13.4l-3.6 3.6a1 1 0 0 1-1.4-1.4l3.6-3.6A7.5 7.5 0 0 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" />
);

// Arrow up / down (income / expense)
const IconArrowUp = (p) => (
  <Icon {...p} d="M12 4a1 1 0 0 1 .7.3l5 5a1 1 0 1 1-1.4 1.4L13 7.4V19a1 1 0 1 1-2 0V7.4l-3.3 3.3A1 1 0 0 1 6.3 9.3l5-5A1 1 0 0 1 12 4Z" />
);
const IconArrowDown = (p) => (
  <Icon {...p} d="M12 20a1 1 0 0 1-.7-.3l-5-5a1 1 0 1 1 1.4-1.4L11 16.6V5a1 1 0 1 1 2 0v11.6l3.3-3.3a1 1 0 0 1 1.4 1.4l-5 5A1 1 0 0 1 12 20Z" />
);

// Category icons (filled, simple)
const IconFork = (p) => ( // food
  <Icon {...p} d="M7 2a1 1 0 0 1 1 1v6a3 3 0 0 1-2 2.83V21a1 1 0 1 1-2 0v-9.17A3 3 0 0 1 2 9V3a1 1 0 1 1 2 0v6a1 1 0 1 0 2 0V3a1 1 0 0 1 1-1Zm10 0a3 3 0 0 1 3 3v7h-2v9a1 1 0 1 1-2 0V5a3 3 0 0 1 1-3Z" />
);
const IconCart = (p) => ( // shopping
  <Icon {...p} d="M2 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 .8l.4 2.2H21a1 1 0 0 1 1 1.18l-1.6 8a2 2 0 0 1-2 1.62H8.6a2 2 0 0 1-2-1.62L4.13 5H3a1 1 0 0 1-1-1Zm6 16a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm10 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
);
const IconHome = (p) => ( // rent / housing
  <Icon {...p} d="M11.3 2.3a1 1 0 0 1 1.4 0l9 8a1 1 0 0 1-1.4 1.4l-.3-.27V20a2 2 0 0 1-2 2h-3v-6h-4v6H6a2 2 0 0 1-2-2v-8.57l-.3.27A1 1 0 0 1 2.3 10.3l9-8Z" />
);
const IconCar = (p) => ( // transport
  <Icon {...p} d="M5 5a2 2 0 0 1 1.86-1.99h10.28A2 2 0 0 1 19 5l1.5 4H21a1 1 0 1 1 0 2h-.13l.13.26V18a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1H8v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6.74L3.13 11H3a1 1 0 1 1 0-2h.5L5 5Zm2 9a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm10 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM6.5 6 5.5 9h13L17.5 6h-11Z" />
);
const IconFilm = (p) => ( // entertainment
  <Icon {...p} d="M4 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4Zm2 2h2v2H6V6Zm10 0h2v2h-2V6ZM6 10h2v2H6v-2Zm10 0h2v2h-2v-2ZM6 14h2v2H6v-2Zm10 0h2v2h-2v-2Z" />
);
const IconHeart = (p) => ( // health
  <Icon {...p} d="M12 21s-7.5-4.4-9.5-9.5C1.2 7.6 4 4 7.5 4c1.9 0 3.6.9 4.5 2.4C12.9 4.9 14.6 4 16.5 4 20 4 22.8 7.6 21.5 11.5 19.5 16.6 12 21 12 21Z" />
);
const IconBook = (p) => ( // education
  <Icon {...p} d="M4 5a3 3 0 0 1 3-3h11a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H7a1 1 0 1 0 0 2h11a1 1 0 1 1 0 2H7a3 3 0 0 1-3-3V5Zm3 0a1 1 0 0 0-1 1v9.17A3 3 0 0 1 7 15h10V4H7a1 1 0 0 0-1 1Z" />
);
const IconGift = (p) => ( // gifts
  <Icon {...p} d="M11 21H5a2 2 0 0 1-2-2v-6h8v8Zm2 0v-8h8v6a2 2 0 0 1-2 2h-6Zm-1-12c-1.66 0-3-1.34-3-3a3 3 0 0 1 3-3 3 3 0 0 1 3 3c0 1.66-1.34 3-3 3Zm-9 1V8a2 2 0 0 1 2-2h3.5A4.5 4.5 0 0 1 12 2a4.5 4.5 0 0 1 3.5 4H19a2 2 0 0 1 2 2v2H3Z" />
);
const IconBriefcase = (p) => ( // salary / work
  <Icon {...p} d="M9 3a2 2 0 0 0-2 2v1H4a2 2 0 0 0-2 2v3h20V8a2 2 0 0 0-2-2h-3V5a2 2 0 0 0-2-2H9Zm0 2h6v1H9V5ZM2 13v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6h-9v1a1 1 0 1 1-2 0v-1H2Z" />
);
const IconSparkle = (p) => ( // freelance / extra
  <Icon {...p} d="M12 2a1 1 0 0 1 1 1v3l3 1 3-1v3l-1 3 1 3h-3l-3 1v3l-1 3-1-3v-3l-3-1H5l1-3-1-3V6l3 1 3-1V3a1 1 0 0 1 1-1Z" />
);

// Person
const IconPerson = (p) => (
  <Icon {...p} d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0H5Z" />
);

// Lock
const IconLock = (p) => (
  <Icon {...p} d="M7 9V7a5 5 0 0 1 10 0v2h.5a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2H7Zm2 0h6V7a3 3 0 0 0-6 0v2Z" />
);

// Globe
const IconGlobe = (p) => (
  <Icon {...p} d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2c1.5 0 3.4 1.7 4.4 5H7.6C8.6 5.7 10.5 4 12 4Zm-7.7 7h2.3c-.1.7-.1 1.3-.1 2s0 1.3.1 2H4.3a8 8 0 0 1 0-4Zm2.7 0h10c.1.7.1 1.3.1 2s0 1.3-.1 2H7c-.1-.7-.1-1.3-.1-2s0-1.3.1-2Zm10.4 0h2.3a8 8 0 0 1 0 4h-2.3c.1-.7.1-1.3.1-2s0-1.3-.1-2ZM7.6 15h8.8c-1 3.3-2.9 5-4.4 5s-3.4-1.7-4.4-5Z" />
);

// Question / help
const IconHelp = (p) => (
  <Icon {...p} d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a3.5 3.5 0 0 1 3.5 3.5c0 1.5-.9 2.4-1.9 3.1-.8.5-1.1.9-1.1 1.4v.5a1 1 0 1 1-2 0V14c0-1.4 1-2.2 1.9-2.8.7-.5 1.1-.8 1.1-1.7a1.5 1.5 0 1 0-3 0 1 1 0 1 1-2 0A3.5 3.5 0 0 1 12 6Zm0 11a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" />
);

// Sun (morning)
const IconSun = IconToday;
// Moon
const IconMoon = (p) => (
  <Icon {...p} d="M21 13.5A9 9 0 1 1 10.5 3 7 7 0 0 0 21 13.5Z" />
);
// Cloud sun (afternoon)
const IconAfternoon = (p) => (
  <Icon {...p} d="M7 11a5 5 0 0 1 9.7-1.7A4 4 0 0 1 17 17H7a3 3 0 0 1 0-6Z" />
);

// Flame (streak)
const IconFlame = (p) => (
  <Icon {...p} d="M12 2c1 4 5 5 5 9.5a5 5 0 0 1-10 0c0-2 1-3 1.5-4 .5 1 1 1.5 1.5 1.5C9 6 11 5 12 2Z" />
);

window.IconToday = IconToday;
window.IconChecklist = IconChecklist;
window.IconWallet = IconWallet;
window.IconSettings = IconSettings;
window.IconPlus = IconPlus;
window.IconCheck = IconCheck;
window.IconTrash = IconTrash;
window.IconChevronRight = IconChevronRight;
window.IconChevronDown = IconChevronDown;
window.IconClose = IconClose;
window.IconCalendar = IconCalendar;
window.IconTag = IconTag;
window.IconBell = IconBell;
window.IconRepeat = IconRepeat;
window.IconFlag = IconFlag;
window.IconNote = IconNote;
window.IconSearch = IconSearch;
window.IconArrowUp = IconArrowUp;
window.IconArrowDown = IconArrowDown;
window.IconFork = IconFork;
window.IconCart = IconCart;
window.IconHome = IconHome;
window.IconCar = IconCar;
window.IconFilm = IconFilm;
window.IconHeart = IconHeart;
window.IconBook = IconBook;
window.IconGift = IconGift;
window.IconBriefcase = IconBriefcase;
window.IconSparkle = IconSparkle;
window.IconPerson = IconPerson;
window.IconLock = IconLock;
window.IconGlobe = IconGlobe;
window.IconHelp = IconHelp;
window.IconSun = IconSun;
window.IconMoon = IconMoon;
window.IconAfternoon = IconAfternoon;
window.IconFlame = IconFlame;
