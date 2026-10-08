// Authentication Service with Username, Email/Gmail, and Google Sign-In support

const USERS_KEY = 'bookmatch_registered_users';
const CURRENT_USER_KEY = 'bookmatch_active_user';

// Pre-seeded accounts so users can log in with username OR email
const DEFAULT_USERS = [
  {
    id: 'user-aman',
    name: 'Aman Dadhich',
    username: 'aman',
    email: 'dadhichaman548@gmail.com',
    password: 'password123',
    avatar: 'AD',
    role: 'Software Engineer',
    authProvider: 'local',
    joinedDate: 'October 2026'
  },
  {
    id: 'user-demo',
    name: 'Tech Reader',
    username: 'reader',
    email: 'reader@gmail.com',
    password: 'password123',
    avatar: 'TR',
    role: 'Book Reviewer',
    authProvider: 'local',
    joinedDate: 'October 2026'
  }
];

export function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USERS;
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

/**
 * Log in with either Username OR Email/Gmail
 */
export function loginUser(identifier, password) {
  if (!identifier.trim() || !password.trim()) {
    throw new Error('Please enter both your username/email and password.');
  }

  const users = getRegisteredUsers();
  const cleanId = identifier.trim().toLowerCase();

  const found = users.find(
    (u) =>
      (u.email.toLowerCase() === cleanId ||
       (u.username && u.username.toLowerCase() === cleanId)) &&
      u.password === password
  );

  if (!found) {
    throw new Error('Invalid username/email or password. Try username "aman" with password "password123".');
  }

  const sessionUser = {
    id: found.id,
    name: found.name,
    username: found.username || found.email.split('@')[0],
    email: found.email,
    avatar: found.avatar || found.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
    role: found.role || 'Member',
    authProvider: found.authProvider || 'local',
    joinedDate: found.joinedDate || 'Recently'
  };

  setCurrentUser(sessionUser);
  return sessionUser;
}

/**
 * Register a new user with Name, Username, Email/Gmail, and Password
 */
export function registerUser(name, username, email, password) {
  if (!name.trim() || !email.trim() || !password.trim()) {
    throw new Error('Please fill in all required fields.');
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const users = getRegisteredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const cleanUsername = (username || name.split(' ')[0]).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error('An account with this email/Gmail already exists.');
  }

  if (users.some((u) => u.username && u.username.toLowerCase() === cleanUsername)) {
    throw new Error('This username is already taken. Please choose another.');
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    username: cleanUsername,
    email: normalizedEmail,
    password: password.trim(),
    avatar: name.trim().split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
    role: 'Member',
    authProvider: 'local',
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  const sessionUser = {
    id: newUser.id,
    name: newUser.name,
    username: newUser.username,
    email: newUser.email,
    avatar: newUser.avatar,
    role: newUser.role,
    authProvider: newUser.authProvider,
    joinedDate: newUser.joinedDate
  };

  setCurrentUser(sessionUser);
  return sessionUser;
}

/**
 * Sign in directly with Google / Gmail
 */
export function loginWithGoogle(gmailAccount = 'dadhichaman548@gmail.com') {
  const users = getRegisteredUsers();
  let existing = users.find((u) => u.email.toLowerCase() === gmailAccount.toLowerCase());

  if (!existing) {
    existing = {
      id: `google-${Date.now()}`,
      name: 'Aman Dadhich',
      username: 'aman_google',
      email: gmailAccount,
      password: '',
      avatar: 'G',
      role: 'Google Verified User',
      authProvider: 'google',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
    users.push(existing);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  const sessionUser = {
    id: existing.id,
    name: existing.name,
    username: existing.username || 'google_user',
    email: existing.email,
    avatar: 'G',
    role: 'Google Verified Member',
    authProvider: 'google',
    joinedDate: existing.joinedDate
  };

  setCurrentUser(sessionUser);
  return sessionUser;
}

export function logoutUser() {
  setCurrentUser(null);
}
