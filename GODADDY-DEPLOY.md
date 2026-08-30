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
```

The admin panel is available at `/admin`. The database is included in the bundle so the current content is preserved. Keep regular backups of the `data/conscept.db` file.

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
