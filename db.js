// Database and sign-in helpers (Firebase, free Spark plan).
// Used by index.html (save a booking) and admin.html (owner page).
import { firebaseConfig, OWNER_EMAIL, isConfigured } from './firebase-config.js';

export { OWNER_EMAIL, isConfigured };

const CDN = 'https://www.gstatic.com/firebasejs/10.14.1/';
let corePromise = null;
let authPromise = null;

function core() {
  if (!isConfigured) return Promise.reject(new Error('not-configured'));
  if (!corePromise) {
    corePromise = Promise.all([import(CDN + 'firebase-app.js'), import(CDN + 'firebase-firestore.js')])
      .then(([appM, fs]) => {
        const app = appM.initializeApp(firebaseConfig);
        return { app, fs, db: fs.getFirestore(app) };
      });
    corePromise.catch(() => { corePromise = null; });
  }
  return corePromise;
}

function auth() {
  if (!authPromise) {
    authPromise = Promise.all([core(), import(CDN + 'firebase-auth.js')])
      .then(([c, a]) => ({ a, inst: a.getAuth(c.app) }));
    authPromise.catch(() => { authPromise = null; });
  }
  return authPromise;
}

// Loads the database in the background so the first booking does not wait.
export function warmUp() {
  if (isConfigured) core().catch(() => {});
}

// ---- Public: save a booking request (no account needed) ----
// Field sizes match the limits in firestore.rules.
export async function saveBooking(b) {
  const { fs, db } = await core();
  const doc = {
    name: String(b.name).trim().slice(0, 80),
    phone: String(b.phone).trim().slice(0, 20),
    service: String(b.service).slice(0, 60),
    date: String(b.date),
    timeOfDay: String(b.timeOfDay).slice(0, 20),
    people: Math.min(20, Math.max(1, parseInt(b.people, 10) || 1)),
    mode: b.mode === 'travel' ? 'travel' : 'studio',
    status: 'new',
    createdAt: fs.serverTimestamp()
  };
  if (b.address) doc.address = String(b.address).trim().slice(0, 200);
  if (b.city) doc.city = String(b.city).trim().slice(0, 80);
  if (b.notes) doc.notes = String(b.notes).trim().slice(0, 500);
  await fs.addDoc(fs.collection(db, 'bookings'), doc);
}

// ---- Owner only ----
export async function signInOwner() {
  const { a, inst } = await auth();
  return a.signInWithPopup(inst, new a.GoogleAuthProvider());
}

export async function signOutOwner() {
  const { a, inst } = await auth();
  return a.signOut(inst);
}

// Calls cb(user or null) now and whenever sign-in changes. Resolves to an unsubscribe function.
export async function onUser(cb) {
  const { a, inst } = await auth();
  return a.onAuthStateChanged(inst, cb);
}

// Live list of bookings, newest first. Resolves to an unsubscribe function.
export async function watchBookings(onData, onError) {
  const { fs, db } = await core();
  const q = fs.query(fs.collection(db, 'bookings'), fs.orderBy('createdAt', 'desc'));
  return fs.onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => {
      const v = d.data();
      return Object.assign({ id: d.id }, v, {
        createdAt: v.createdAt && v.createdAt.toDate ? v.createdAt.toDate() : null
      });
    }));
  }, onError);
}

export async function setStatus(id, status) {
  const { fs, db } = await core();
  return fs.updateDoc(fs.doc(db, 'bookings', id), { status });
}

export async function removeBooking(id) {
  const { fs, db } = await core();
  return fs.deleteDoc(fs.doc(db, 'bookings', id));
}
