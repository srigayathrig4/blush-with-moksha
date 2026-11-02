# Connect the booking database (free)

After this, every booking from the website is saved, and the owner sees all of them on a private page
(`admin.html`) where she can confirm, cancel, call or reply on WhatsApp.
Customers do not need an account. WhatsApp still opens for every booking, so no request is missed.

It uses Firebase on its free plan (Spark). Do not turn on billing.
Menu names in Firebase change now and then, so a button may look slightly different from what is written here.

Do steps 1 to 4 signed in to Google as the **studio Gmail** (blushwithmokshamakeupstudio@gmail.com),
because that is the account that will be allowed to see bookings.

---

## Step 1. Create the project

1. Open https://console.firebase.google.com and sign in.
2. Click **Create a project** (or **Add project**). Name it `blush-with-moksha`.
3. Turn **Google Analytics off**, then click **Create project**.

## Step 2. Create the database and add the security rules

1. In the left menu open **Build > Firestore Database** and click **Create database**.
2. If it asks for an edition, choose **Standard**.
3. Location: **asia-south1 (Mumbai)**. This cannot be changed later.
4. Choose **Start in production mode**, then **Create**.
5. Open the **Rules** tab. Delete everything in the box, then paste the whole content of the file
   `firestore.rules` from this folder. Click **Publish**.

These rules let anyone send a booking, but only in the right format. Only the studio Gmail can read, change or delete bookings.
If you ever use a different Gmail for the owner, change the email in `firestore.rules` (in `isOwner`) and
`OWNER_EMAIL` in `firebase-config.js`, and publish the rules again.

## Step 3. Connect the website to the project

1. On the project home page click the web icon **`</>`**.
2. Nickname: `website`. Leave Firebase Hosting unticked. Click **Register app**.
3. You will see a block called `firebaseConfig`. Open `firebase-config.js` from this folder and replace each
   `PASTE_...` value with the matching value (`apiKey`, `authDomain`, `projectId`, `appId`). Keep the quote marks.

These values are not secret. The rules from step 2 are what protect the data.

## Step 4. Turn on Google sign-in for the owner

1. Open **Build > Authentication** and click **Get started**.
2. Open **Sign-in method**, choose **Google**, switch it **Enable**, pick the studio Gmail as the support email, and **Save**.
3. Open **Authentication > Settings > Authorized domains** and **Add domain**. Enter the address of your live site,
   for example `blushwithmoksha.netlify.app` (no `https://`). `localhost` is already there for testing.

## Step 5. Put the updated site online (or test on your computer)

- **Online:** upload the whole folder again at https://app.netlify.com/drop (drag the folder onto the page).
- **On your computer:** open the folder in a terminal and run `python -m http.server 8000`, then open
  http://localhost:8000. The database does not work if you double-click `index.html`, because browsers block it.

## Step 6. Test it

1. Open the site and make a test booking. You should see "Your request is saved with the studio".
2. Open `/admin.html` on the site (for example `https://blushwithmoksha.netlify.app/admin.html`).
3. Click **Sign in with Google** with the studio Gmail. Your test booking should appear.
4. Press **Delete** on the test booking.

---

## Day to day

- The owner bookmarks the `/admin.html` address on her phone. New bookings appear by themselves.
- **Confirm**, **Cancel booking** and **Mark done** change the status. **Reply on WhatsApp** opens a ready message to the customer.
  **Call** dials them.
- The page is hidden from Google search, but anyone who knows the address can open it. Only the studio Gmail can see bookings.

## Good to know

- **Free limits:** the free plan allows tens of thousands of reads and writes per day, far more than a studio needs.
- **Keep the studio Gmail safe.** Turn on 2-step verification for it, because it opens the customers' names and phone numbers.
- **Spam:** anyone can send a booking request, so a few fake ones are possible. Delete them on the owner page.
  If it becomes a problem, Firebase App Check can be added later.
- **Privacy:** the booking form tells customers their details are only used to arrange the appointment. Keep to that.

## If something goes wrong

| What you see | What to do |
|---|---|
| "The database is not connected yet" on the owner page | The `PASTE_...` values in `firebase-config.js` are still there (step 3), or the new files were not uploaded. |
| "This website address is not allowed to sign in yet" | Add the site address under Authorized domains (step 4). |
| "Bookings cannot be shown" | The rules are not published (step 2), or you signed in with a different Google account. |
| "We could not save this online" on the booking form | Same causes as above. The WhatsApp message still reaches the studio. |
| Blank owner page after double-clicking the file | Open it from the website address, or from `http://localhost:8000` (step 5). |
