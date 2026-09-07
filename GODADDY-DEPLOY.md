# GoDaddy deployment

This bundle is the application source for GoDaddy Node.js Hosting. It requires GoDaddy hosting with Node.js application support; it cannot run as a static HTML upload.

## Upload

1. Upload this ZIP with `package.json` at the ZIP root.
2. Set the application startup file to `server.js` if GoDaddy asks for one.
3. Use Node.js 22.5 or newer. The app uses Node's built-in SQLite support.
4. Set the application root to the directory containing `server.js`.
5. Restart the Node.js application after uploading.

GoDaddy installs dependencies and runs the production build automatically. `node_modules` and `.next` are intentionally not included.

## Environment variables

Add these in GoDaddy’s Node.js application environment settings. Do not put them in the ZIP.

```text
# Optional when using the first-use setup flow. If provided, these remain a
# fallback until credentials are created from the admin login screen.
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<bcrypt hash for the chosen admin password>
SESSION_SECRET=<long random secret>
RESEND_API_KEY=<optional>
CONTACT_EMAIL_FROM=<optional verified sender address>

# Required for content persistence across application rebuilds. Set these to
# writable directories outside the application root/release directory.
DATA_DIR=/home/<account>/conscept-data
UPLOADS_DIR=/home/<account>/conscept-data/uploads
```

The admin panel is available at `/admin`. `DATA_DIR` stores the SQLite database
and `UPLOADS_DIR` stores uploaded files. Both must be outside the application
directory if GoDaddy replaces that directory during a rebuild. Create the
directories first, copy the current `data/conscept.db` into `DATA_DIR`, copy
the current upload files into `UPLOADS_DIR`, configure the environment
variables, and restart the application. Keep regular content exports as an
additional backup.

If `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH` are not set, open `/admin/login`
and click the ConScept logo to create the first admin password. After that,
clicking the logo opens password recovery; recovery verifies the current
password before allowing a replacement. `SESSION_SECRET` is still required
for admin sessions.

## If GoDaddy asks for a start command

Use:

```text
node server.js
```
